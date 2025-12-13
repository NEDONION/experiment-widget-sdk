# 素材分配策略说明

## 当前实现机制

### 前端行为

**用户标识生成**：
```javascript
// localStorage 中持久化存储
anon_id = "anon_1702454321000_xyz123abc"
```
- 首次访问时生成
- 存储在 localStorage
- 同一浏览器永久保持不变（除非清除缓存）

**分配请求**：
```
GET /experiments/{experiment_id}/assign?user_key={user_key}
```
- 每次页面加载/刷新都会请求
- `user_key` = 用户提供的 ID 或自动生成的 `anon_id`

---

## 📊 三种分配策略

### 策略 1：固定分配（推荐用于 A/B 测试）

**特点**：同一用户永远看到相同素材

**后端实现示例**：

```javascript
// Node.js / Express
app.get('/experiments/:experimentId/assign', (req, res) => {
  const { experimentId } = req.params;
  const { user_key } = req.query;

  // 基于 user_key 做哈希分组
  const hash = hashCode(user_key + experimentId);
  const variantIndex = Math.abs(hash) % variants.length;
  const variant = variants[variantIndex];

  res.json({
    code: 0,
    data: {
      creative_id: variant.creative_id,
      title: variant.title,
      image_url: variant.image_url,
      // ...
    }
  });
});

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
```

**结果**：
- ✅ 用户 A 第 1 次访问 → 素材 1
- ✅ 用户 A 第 2 次访问 → 素材 1（相同）
- ✅ 用户 A 刷新 100 次 → 素材 1（始终相同）
- ✅ 用户 B 访问 → 素材 2（根据哈希结果）

**适用场景**：
- ✅ A/B 测试
- ✅ 个性化推荐
- ✅ 需要统计转化率的场景

---

### 策略 2：随机分配

**特点**：每次刷新都可能看到不同素材

**后端实现示例**：

```javascript
app.get('/experiments/:experimentId/assign', (req, res) => {
  const { experimentId } = req.params;

  // 随机选择一个素材
  const randomIndex = Math.floor(Math.random() * variants.length);
  const variant = variants[randomIndex];

  res.json({
    code: 0,
    data: {
      creative_id: variant.creative_id,
      title: variant.title,
      image_url: variant.image_url,
      // ...
    }
  });
});
```

**结果**：
- 🔄 用户 A 第 1 次访问 → 素材 1
- 🔄 用户 A 第 2 次访问 → 素材 3（随机）
- 🔄 用户 A 第 3 次访问 → 素材 2（随机）

**适用场景**：
- ✅ 广告轮播
- ✅ 内容探索
- ✅ 不需要精确 A/B 测试的场景

---

### 策略 3：混合策略（时间窗口 + 固定分配）

**特点**：在一定时间内固定，超时后重新分配

**后端实现示例**：

```javascript
// 使用 Redis 缓存用户分配结果
app.get('/experiments/:experimentId/assign', async (req, res) => {
  const { experimentId } = req.params;
  const { user_key } = req.query;

  const cacheKey = `exp:${experimentId}:user:${user_key}`;

  // 检查缓存（有效期 24 小时）
  let assignment = await redis.get(cacheKey);

  if (!assignment) {
    // 缓存未命中，进行新分配
    const hash = hashCode(user_key + experimentId);
    const variantIndex = Math.abs(hash) % variants.length;
    assignment = variants[variantIndex];

    // 缓存 24 小时
    await redis.setex(cacheKey, 86400, JSON.stringify(assignment));
  } else {
    assignment = JSON.parse(assignment);
  }

  res.json({
    code: 0,
    data: assignment
  });
});
```

**结果**：
- ✅ 用户 A 今天 → 素材 1（固定）
- ✅ 用户 A 明天 → 素材 2（可能变化）

**适用场景**：
- ✅ 每日推荐
- ✅ 限时活动
- ✅ 需要周期性更新的内容

---

## 🎯 推荐方案

### 对于 A/B 测试（最常见）

使用**策略 1：固定分配**

```javascript
// 完整示例
const crypto = require('crypto');

app.get('/experiments/:experimentId/assign', (req, res) => {
  const { experimentId } = req.params;
  const { user_key } = req.query;

  if (!user_key) {
    return res.status(400).json({
      code: 400,
      message: 'user_key is required'
    });
  }

  // 从数据库获取实验配置
  const experiment = getExperimentById(experimentId);

  if (!experiment) {
    return res.status(404).json({
      code: 404,
      message: 'Experiment not found'
    });
  }

  // 计算用户应该看到哪个变体
  const hash = crypto.createHash('md5')
    .update(user_key + experimentId)
    .digest('hex');
  const hashInt = parseInt(hash.substring(0, 8), 16);
  const bucket = hashInt % 100; // 0-99

  // 根据流量分配比例选择变体
  // 例如：变体A 50%，变体B 50%
  let variant;
  if (bucket < 50) {
    variant = experiment.variants[0]; // 变体 A
  } else {
    variant = experiment.variants[1]; // 变体 B
  }

  res.json({
    code: 0,
    data: {
      creative_id: variant.creative_id,
      title: variant.title,
      product_name: variant.product_name,
      cta_text: variant.cta_text,
      image_url: variant.image_url,
      selling_points: variant.selling_points
    }
  });
});
```

### 流量分配示例

```javascript
// 3 个变体，流量比例 50:30:20
const variants = [
  { id: 'A', weight: 50, content: {...} },
  { id: 'B', weight: 30, content: {...} },
  { id: 'C', weight: 20, content: {...} }
];

const bucket = hashInt % 100; // 0-99

if (bucket < 50) {
  return variants[0]; // A: 0-49 (50%)
} else if (bucket < 80) {
  return variants[1]; // B: 50-79 (30%)
} else {
  return variants[2]; // C: 80-99 (20%)
}
```

---

## 📈 数据分析

使用固定分配后，你可以准确统计：

```sql
-- 每个变体的曝光次数
SELECT creative_id, COUNT(*) as impressions
FROM impression_events
WHERE experiment_id = 'exp_123'
GROUP BY creative_id;

-- 每个变体的点击率
SELECT
  creative_id,
  COUNT(DISTINCT CASE WHEN event = 'impression' THEN anon_id END) as unique_users,
  COUNT(CASE WHEN event = 'impression' THEN 1 END) as impressions,
  COUNT(CASE WHEN event = 'click' THEN 1 END) as clicks,
  ROUND(100.0 * COUNT(CASE WHEN event = 'click' THEN 1 END) /
    COUNT(CASE WHEN event = 'impression' THEN 1 END), 2) as ctr
FROM events
WHERE experiment_id = 'exp_123'
GROUP BY creative_id;
```

---

## 🔄 前端缓存策略（可选）

如果不想每次刷新都请求后端，可以在前端缓存分配结果：

```typescript
// 在 widget.ts 中添加缓存逻辑
private async assign(): Promise<void> {
  const cacheKey = `exp_assign_${this.config.experimentId}_${this.anonId}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    // 使用缓存的分配结果（本次会话有效）
    const data = JSON.parse(cached);
    this.renderCreative(data);
    return;
  }

  // 请求后端
  const response = await this.apiClient.get<AssignData>(...);

  if (response.code === 0 && response.data) {
    // 缓存结果
    sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
    this.renderCreative(response.data);
  }
}
```

**效果**：
- 同一会话（标签页未关闭）内不重复请求
- 关闭标签页后重新请求
- 减轻后端压力

---

## 总结

| 策略 | 同一用户多次访问 | 适用场景 | 实现难度 |
|------|-----------------|---------|---------|
| **固定分配** | 总是看到相同素材 | A/B 测试、个性化推荐 | ⭐⭐ |
| **随机分配** | 每次可能不同 | 广告轮播、内容探索 | ⭐ |
| **混合策略** | 时间窗口内固定 | 每日推荐、限时活动 | ⭐⭐⭐ |

**✅ 推荐：使用固定分配策略**，这是 A/B 测试的标准做法。
