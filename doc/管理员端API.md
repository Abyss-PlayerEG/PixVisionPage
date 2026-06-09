# PixVision 管理员前端 API 参考文档

---

## 1. 基础信息

| 项目 | 说明 |
|------|------|
| 服务地址 | `http://localhost:9090` |
| 字符编码 | UTF-8 |
| 请求方式 | POST / GET（具体见各接口） |
| Content-Type | `application/x-www-form-urlencoded`（POST 时参数通过 `@RequestParam` 接收） |
| 跨域支持 | 已配置 CORS，支持跨域请求 |

### 1.1 通用响应结构

所有接口统一返回以下 JSON 结构：

```json
{
  "data": "任意类型",
  "message": "响应说明信息",
  "recode": 200,
  "status": "SUCCESS",
  "time_str": "2026/06/01 12:00:00"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| data | any | 响应数据，具体类型见各接口 |
| message | string | 响应说明信息 |
| recode | int | 状态码：200=成功，500=失败 |
| status | string | `SUCCESS` 或 `ERROR` |
| time_str | string | 响应时间，格式 `yyyy/MM/dd HH:mm:ss` |

---

## 2. 认证与授权

### 2.1 Token 获取方式

调用 `POST /api/auth/login` 登录接口获取 JWT Token，登录时需传入：
- `usernameOrEmail`：用户名或邮箱
- `password`：明文密码（后端自动 SHA-256 加密比对）
- `vCode`：邮箱验证码（6 位大写字母/数字）

登录成功返回 `UserLogin` 对象，其中包含 `token` 字段。

### 2.2 Token 使用方式

后续所有需要认证的请求，在 Header 中携带：

```
Authorization: Bearer <token>
```

也可通过 URL 参数传递：`?token=<token>`

Token 有效期 7 天。

### 2.3 角色权限体系

| 角色代码 | 角色名称 | 说明 |
|----------|----------|------|
| 11 | 普通用户 | 默认角色 |
| 22 | 创作者 | 可发布作品 |
| 55 | 审核员 | 可审核内容、查看待审核列表 |
| 66 | 工单管理员 | 工单管理 |
| 77 | 系统管理员 | 最高权限，可管理用户、删除数据 |

> 管理员前端至少需要 **55（审核员）** 或 **77（系统管理员）** 角色。

### 2.4 各模块所需权限一览

| 模块 | Controller | 基础权限 | 部分接口需 |
|------|-----------|---------|-----------|
| 用户管理 | AdminUserController | 55, 77 | 增删改操作需 **77** |
| 作品管理 | AdminWorksController | 55, 77 | 删除作品需 **77** |
| 评论管理 | AdminCommentsController | 55, 77 | 删除评论需 **77** |
| 合集管理 | AdminSeriesController | 55, 77 | 删除/修改合集信息需 **77** |
| AI 审核记录 | AdminAuditRecordController | 55, 77 | - |
| 用户数据变更审核 | AdminUserDataChangeController | 55, 77 | - |
| 操作日志 | AdminLoggerController | 77 | 全部需 **77** |

---

## 3. 全局枚举值

### 3.1 审核状态 (approvalStatus)

| 代码 | 含义 |
|------|------|
| 10 | 正常（通过审核） |
| 20 | 待审核 |
| 30 | 未过审（违规/封禁） |

### 3.2 用户角色 (user_role / role)

| 代码 | 含义 |
|------|------|
| 11 | 普通用户 |
| 22 | 创作者 |
| 55 | 审核员 |
| 66 | 工单管理员 |
| 77 | 系统管理员 |

### 3.3 用户状态 (status)

| 代码 | 含义 |
|------|------|
| 10 | 正常 |
| 20 | 冻结（保留数据，不可登录） |
| 30 | 封禁（严重违规） |

### 3.4 内容类型 (contentType)

| 代码 | 含义 |
|------|------|
| 100 | 作品 |
| 200 | 评论 |
| 300 | 系列（合集） |
| 400 | 昵称 |

### 3.5 变更类型 (type - 用户数据变更审核)

| 代码 | 含义 |
|------|------|
| 100 | 昵称修改 |
| 200 | 权限申请 |
| 300 | 头像修改 |

### 3.6 排序方式 (orderBy)

| 值 | 含义 |
|------|------|
| `newest` | 最新优先（默认） |
| `oldest` | 最早优先 |
| `mostLikes` | 最多点赞（仅作品） |
| `mostStars` | 最多收藏（仅作品） |
| `mostViews` | 最多查看（仅作品） |

---

## 4. 通用数据类型

### 4.1 批量操作结果 - AdminBatchOperateWorkResult

用于作品、合集、用户数据变更等批量操作返回。

| 字段 | 类型 | 说明 |
|------|------|------|
| totalCount | integer | 操作总数 |
| successCount | integer | 成功数 |
| failedWorkIds | integer[] | 失败 ID 列表 |

### 4.2 批量操作评论结果 - AdminBatchOperateCommentResult

| 字段 | 类型 | 说明 |
|------|------|------|
| totalCount | integer | 操作总数 |
| successCount | integer | 成功数 |
| failedWorkIds | integer[] | 失败 ID 列表 |

### 4.3 批量更新用户结果 - AdminBatchUpdateUserResult

| 字段 | 类型 | 说明 |
|------|------|------|
| totalCount | integer | 操作总数 |
| successCount | integer | 成功数 |
| failedUserIds | integer[] | 失败 ID 列表 |

### 4.4 批量删除用户结果 - AdminBatchDeleteUserResult

| 字段 | 类型 | 说明 |
|------|------|------|
| totalCount | integer | 操作总数 |
| successCount | integer | 成功数 |
| failedUserIds | integer[] | 失败 ID 列表 |

### 4.5 批量重置密码结果 - AdminResetPasswordResult

| 字段 | 类型 | 说明 |
|------|------|------|
| totalCount | integer | 操作总数 |
| successCount | integer | 成功数 |
| emailSentCount | integer | 邮件发送成功数 |
| failedUserIds | integer[] | 失败 ID 列表 |

### 4.6 分页对象 IPage\<T\>

| 字段 | 类型 | 说明 |
|------|------|------|
| records | T[] | 当前页数据列表 |
| total | long | 总条数 |
| size | long | 每页大小 |
| current | long | 当前页码 |
| pages | long | 总页数 |

---

## 5. API 接口详情

---

### 5.1 用户管理 (`/api/admin/user`)

#### 5.1.1 分页查询用户信息

```
POST /api/admin/user/page-select
权限要求：55, 77
```

**请求参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | integer | 是 | 1 | 页码 |
| size | integer | 是 | 10 | 每页条目数 |
| user_role | integer | 否 | - | 用户角色（11/22/55/66/77） |
| status | integer | 否 | - | 用户状态（10/20/30） |
| is_delete | boolean | 否 | - | true=仅查已删除，false=仅查未删除 |
| nickname | string | 否 | - | 昵称关键字（模糊匹配） |
| orderBy | string | 否 | newest | 排序：newest/oldest |

**返回数据：** `IPage<User>` — User 实体字段见下表

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | integer | 用户 ID |
| user_uuid | byte[] | 用户 UUID（二进制） |
| string_user_uuid | string | 用户 UUID 字符串 |
| username | string | 用户名 |
| password | string | SHA-256 加密密码 |
| nickname | string | 昵称 |
| user_role | integer | 角色代码 |
| avatar_url | string | 头像路径 |
| email | string | 绑定邮箱 |
| is_delete | boolean | 删除标记 |
| status | integer | 账户状态 |
| update_time | timestamp | 更新时间 |
| update_user | integer | 更新者 ID |
| create_time | timestamp | 创建时间 |
| create_user | integer | 创建者 ID |
| work_count | integer | 作品发布数（统计字段） |
| total_likes | long | 被点赞总数（统计字段） |
| total_stars | long | 被收藏总数（统计字段） |
| total_views | long | 被查看总数（统计字段） |

---

#### 5.1.2 批量更新用户信息

```
POST /api/admin/user/update/user-role-status
权限要求：77
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userIds | integer[] | 是 | 目标用户 ID 列表 |
| newRole | integer | 否 | 新角色（11/22/55/66/77） |
| newStatus | integer | 否 | 新状态（10/20/30） |
| newAvatar | string | 否 | 新头像路径 |
| resetNickname | boolean | 否(默认true) | 是否重置昵称 |

> 至少提供 newRole、newStatus、newAvatar、resetNickname 中的一个。修改状态时会强制用户下线。

**返回数据：** `AdminBatchUpdateUserResult`

---

#### 5.1.3 批量删除用户账户

```
POST /api/admin/user/delete
权限要求：77
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userIds | integer[] | 是 | 目标用户 ID 列表 |

> 逻辑删除（is_delete=1），数据保留。管理员不能删除自己。

**返回数据：** `AdminBatchDeleteUserResult`

---

#### 5.1.4 创建新用户

```
POST /api/admin/user/create
权限要求：77
```

**请求参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| username | string | 是 | - | 用户名（唯一） |
| password | string | 是 | - | 密码（明文，自动加密） |
| confirmPassword | string | 是 | - | 确认密码 |
| nickname | string | 是 | - | 昵称 |
| email | string | 是 | - | 邮箱（唯一） |
| role | integer | 否 | 11 | 角色代码 |
| status | integer | 否 | 10 | 状态代码 |

> 无需验证码。密码需两次输入一致。

**返回数据：** `boolean`（true/false）

---

#### 5.1.5 批量重置用户密码

```
POST /api/admin/user/update/password
权限要求：77
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userIds | integer[] | 是 | 目标用户 ID 列表 |

> 自动生成12位随机密码，SHA-256加密存储，强制所有设备下线，并通过邮件发送新密码。

**返回数据：** `AdminResetPasswordResult`

---

#### 5.1.6 批量初始化用户头像和昵称

```
POST /api/admin/user/init-avatar-nickname
权限要求：77
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userIds | integer[] | 是 | 目标用户 ID 列表 |

> 随机分配默认头像（default/1.png ~ default/21.png）和随机昵称（user_xxxxxxxxxx）。

**返回数据：** `AdminBatchUpdateUserResult`

---

#### 5.1.7 刷新所有用户权限缓存

```
POST /api/admin/user/refresh-permission-cache
权限要求：77
```

> 清除所有用户的角色缓存，下次请求时重新加载。通常在批量修改角色后调用。

**返回数据：** `integer`（清除的缓存数量）

---

### 5.2 作品管理 (`/api/admin/works`)

#### 5.2.1 分页查询作品列表

```
GET /api/admin/works/page/{current}/{size}
权限要求：55, 77
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| current | long | 当前页码，从1开始 |
| size | long | 每页大小，范围 1-500 |

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| keyword | string | 否 | - | 模糊搜索作品标题 |
| orderBy | string | 否 | newest | newest/oldest/mostLikes/mostStars/mostViews |
| isOriginal | boolean | 否 | - | true=原创，false=转载 |
| approvalStatus | integer | 否 | - | 审核状态（10/20/30） |
| isDelete | boolean | 否 | - | true=已删除，false=未删除（不传默认只查未删除） |

**返回数据：** `IPage<AdminWorkVO>`

AdminWorkVO 继承 Works 实体，额外字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| work_id | integer | 作品 ID |
| user_id | integer | 用户 ID |
| work_title | string | 作品标题（最多16字符） |
| img_url | string | 图片 URL |
| thumb_url | string | 封面缩略图文件名 |
| series_id | integer | 系列 ID |
| like_count | integer | 点赞数 |
| star_count | integer | 收藏数 |
| view_count | integer | 查看数 |
| is_original_work | boolean | 1=原创，0=转载 |
| out_url | string | 外部转载链接 |
| approval_status | integer | 审核状态 |
| is_delete | boolean | 删除标记 |
| update_time | timestamp | 更新时间 |
| update_user | integer | 修改者 ID |
| create_time | timestamp | 创建时间 |
| create_user | integer | 创建者 ID |
| audit_reason | string | AI 审核判断依据 |
| insult_words | string | 命中敏感词（JSON数组字符串） |

---

#### 5.2.2 批量更新作品审核状态

```
POST /api/admin/works/update/approval-status
权限要求：55, 77
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workIds | integer[] | 是 | 作品 ID 列表 |
| approvalStatus | integer | 是 | 审核状态（10/20/30） |

**返回数据：** `AdminBatchOperateWorkResult`

---

#### 5.2.3 批量删除作品

```
POST /api/admin/works/delete
权限要求：77
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workIds | integer[] | 是 | 作品 ID 列表 |

> 逻辑删除，原图和封面文件同步重命名为 .del 后缀。

**返回数据：** `AdminBatchOperateWorkResult`

---

#### 5.2.4 批量更新作品标题

```
POST /api/admin/works/update/work-title
权限要求：55, 77
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workIds | integer[] | 是 | 作品 ID 列表 |
| workTitle | string | 是 | 新标题（最多16字符） |

**返回数据：** `AdminBatchOperateWorkResult`

---

### 5.3 评论管理 (`/api/admin/comments`)

#### 5.3.1 分页查询评论列表

```
GET /api/admin/comments/page/{current}/{size}
权限要求：55, 77
```

**路径参数：** current (long), size (long, 范围 1-500)

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| workId | integer | 否 | - | 作品 ID |
| userId | integer | 否 | - | 用户 ID |
| commentFloor | integer | 否 | - | 1=一级评论，2=二级评论 |
| approvalStatus | integer | 否 | - | 审核状态（10/20/30） |
| keyword | string | 否 | - | 模糊搜索评论内容 |
| orderBy | string | 否 | newest | newest/oldest |

**返回数据：** `IPage<AdminCommentVO>`

AdminCommentVO 继承 BaseComment 实体，额外字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| comment_id | integer | 评论 ID |
| user_id | integer | 用户 ID |
| work_id | integer | 作品 ID |
| parent_comment_id | integer | 父评论 ID |
| in_comment_id | integer | 所属一级评论 ID |
| comment_floor | integer | 评论层级（1/2） |
| comment_text | string | 评论内容（最多125字） |
| approval_status | integer | 审核状态 |
| is_delete | boolean | 删除标记 |
| time | datetime | 评论时间 |
| audit_reason | string | AI 审核判断依据 |
| insult_words | string | 命中敏感词（JSON数组字符串） |

---

#### 5.3.2 批量更新评论审核状态

```
POST /api/admin/comments/update/approval-status
权限要求：55, 77
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| commentIds | integer[] | 是 | 评论 ID 列表 |
| approvalStatus | integer | 是 | 审核状态（10/20/30） |

> 更新一级评论时自动级联更新所有二级评论。

**返回数据：** `AdminBatchOperateCommentResult`

---

#### 5.3.3 批量删除评论

```
POST /api/admin/comments/delete
权限要求：77
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| commentIds | integer[] | 是 | 评论 ID 列表 |

> 逻辑删除。删除一级评论时自动级联删除所有二级评论。

**返回数据：** `AdminBatchOperateCommentResult`

---

### 5.4 合集管理 (`/api/admin/series`)

#### 5.4.1 分页查询作品合集

```
GET /api/admin/series/page/{current}/{size}
权限要求：55, 77
```

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| keyword | string | 否 | - | 搜索关键词（同时匹配标题和描述） |
| status | integer | 否 | - | 审核状态（10/20/30） |
| isDelete | boolean | 否 | - | true=已删除，false=未删除 |
| userId | integer | 否 | - | 用户 ID |
| orderBy | string | 否 | newest | newest/oldest |

**返回数据：** `IPage<AdminSeriesVO>`

AdminSeriesVO 继承 Series 实体，额外字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| series_id | integer | 合集 ID |
| user_id | integer | 用户 ID |
| series_title | string | 合集标题（最多16字符） |
| about_text | string | 合集描述（最多24字符） |
| thumb_url | string | 封面缩略图文件名 |
| approval_status | integer | 审核状态 |
| is_delete | boolean | 删除标记 |
| update_time | timestamp | 更新时间 |
| update_user | integer | 修改者 ID |
| create_time | timestamp | 创建时间 |
| create_user | integer | 创建者 ID |
| audit_reason | string | AI 审核判断依据 |
| insult_words | string | 命中敏感词（JSON数组字符串） |

---

#### 5.4.2 批量更新作品合集审核状态

```
POST /api/admin/series/update/approval-status
权限要求：55, 77
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| seriesIds | integer[] | 是 | 合集 ID 列表 |
| approvalStatus | integer | 是 | 审核状态（10/20/30） |

**返回数据：** `AdminBatchOperateWorkResult`

---

#### 5.4.3 批量删除作品合集

```
POST /api/admin/series/delete
权限要求：77
```

**请求参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| seriesIds | integer[] | 是 | - | 合集 ID 列表 |
| deleteWorks | boolean | 否 | false | true=同时删除合集内作品，false=仅置空 series_id |

**返回数据：** `AdminBatchOperateWorkResult`

---

#### 5.4.4 批量更新合集信息

```
POST /api/admin/series/update/series-info
权限要求：77
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| seriesIds | integer[] | 是 | 合集 ID 列表 |
| seriesName | string | 否 | 新名称（最多16字符） |
| seriesDescription | string | 否 | 新描述（最多24字符） |

> seriesName 和 seriesDescription 至少提供一个。

**返回数据：** `AdminBatchOperateWorkResult`

---

### 5.5 AI 审核记录 (`/api/admin/audit-records`)

#### 5.5.1 分页查询 AI 审核记录

```
GET /api/admin/audit-records/page/{current}/{size}
权限要求：55, 77
```

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| contentType | integer | 否 | - | 内容类型（100/200/300/400） |
| approvalStatus | integer | 否 | - | 审核状态（10/20/30） |
| keyword | string | 否 | - | 模糊搜索审核原因 |
| orderBy | string | 否 | newest | newest/oldest |

**返回数据：** `IPage<AdminAuditRecordVO>`

| 字段 | 类型 | 说明 |
|------|------|------|
| record_id | integer | 记录 ID |
| content_type | integer | 内容类型（100/200/300/400） |
| content_id | integer | 对应内容 ID |
| approval_status | integer | 审核结果（10/20/30） |
| audit_reason | string | AI 审核判断依据 |
| insult_words | string | 命中敏感词（JSON数组） |
| original_content | string | 被审核的原始内容 |
| create_time | timestamp | 审核时间 |

---

### 5.6 用户数据变更审核 (`/api/admin/user-data-change`)

#### 5.6.1 分页查询待审核记录

```
GET /api/admin/user-data-change/pending/{current}/{size}
权限要求：55, 77
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | integer | 否 | 变更类型（100/200/300） |

> 只返回待审核状态（approval_status=20）的记录，按提交时间倒序。

**返回数据：** `IPage<UserDataChangeLockVO>`

| 字段 | 类型 | 说明 |
|------|------|------|
| lock_id | integer | 主键 |
| user_id | integer | 待审核用户 ID |
| username | string | 用户名 |
| user_current_nickname | string | 用户当前昵称 |
| type | integer | 变更类型（100/200/300） |
| nickname | string | 待审核昵称（type=100） |
| user_role | integer | 申请的角色代码（type=200） |
| avatar_url | string | 待审核头像路径（type=300） |
| old_data | string | 旧数据（用于回滚） |
| create_time | timestamp | 提交时间 |
| audit_reason | string | AI 审核判断依据 |
| insult_words | string | 命中敏感词 |

---

#### 5.6.2 批量审核用户数据变更

```
POST /api/admin/user-data-change/review
权限要求：55, 77
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| lockIds | integer[] | 是 | lock_id 列表 |
| approved | boolean | 是 | true=通过，false=拒绝 |

> 通过时：昵称更新到用户表、角色更新并清除缓存、头像 .pend 文件重命名为正常后缀。
> 拒绝时：头像 .pend 文件重命名为 .fail。

**返回数据：** `AdminBatchOperateWorkResult`

---

### 5.7 操作日志 (`/api/admin/logs`)

#### 5.7.1 分页查询操作日志

```
GET /api/admin/logs/page/{current}/{size}
权限要求：77
```

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| keyword | string | 否 | - | 模糊搜索操作事件（log_event） |
| orderBy | string | 否 | newest | newest/oldest |

> 用户名通过 Redis 缓存（TTL 1小时），即使用户被删除也能正常展示。

**返回数据：** `IPage<OperateLogVO>`

| 字段 | 类型 | 说明 |
|------|------|------|
| sys_log_id | integer | 日志 ID |
| user_id | integer | 操作者用户 ID |
| username | string | 操作者用户名 |
| log_datetime | timestamp | 操作时间 |
| log_event | string | 操作事件描述 |

---

## 6. 认证相关接口（供参考）

### 6.1 登录

```
POST /api/auth/login
公开接口，无需认证
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usernameOrEmail | string | 是 | 用户名或邮箱 |
| password | string | 是 | 明文密码 |
| vCode | string | 是 | 邮箱验证码 |

**返回数据 data 字段（UserLogin）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | integer | 用户 ID |
| string_user_uuid | string | 用户 UUID 字符串 |
| username | string | 用户名 |
| nickname | string | 昵称 |
| avatar_url | string | 头像路径 |
| email | string | 邮箱 |
| status | integer | 账户状态 |
| user_role | integer | 角色代码 |
| token | string | JWT Token |

### 6.2 登出

```
POST /api/auth/logout
需要认证
```
携带 Token 即可，将 Token 移出白名单使其失效。

---

## 7. 前端开发注意事项

### 7.1 请求参数格式

所有 POST 接口使用 `@RequestParam` 接收参数，前端应使用 `application/x-www-form-urlencoded` 格式提交，数组参数多次传递同名 key：

```
POST /api/admin/works/update/approval-status
Content-Type: application/x-www-form-urlencoded

workIds=1&workIds=2&workIds=3&approvalStatus=30
```

GET 接口的路径参数直接在 URL 中替换。

### 7.2 分页列表渲染

分页接口返回 `IPage` 对象，关键字段：
- `records`：数据列表
- `total`：总条数
- `pages`：总页数

查询结果为空时返回 `records: [], total: 0`，状态码仍为 200。

### 7.3 审核状态展示映射

| 代码 | 标签 | 建议颜色 |
|------|------|----------|
| 10 | 正常 | 绿色 |
| 20 | 待审核 | 橙色 |
| 30 | 未过审/违规 | 红色 |

### 7.4 批量操作 UI 建议

- 所有批量操作接口都会返回部分失败信息（failedWorkIds / failedUserIds），前端应展示操作统计并高亮失败的条目
- 批量更新/删除操作即时生效，无需刷新页面即可看到结果
- 操作前建议二次确认弹窗

### 7.5 权限控制建议

前端应根据 `user_role` 字段控制界面：
- role=55（审核员）：可查看所有列表、可执行审核操作，不可删除/管理用户
- role=77（系统管理员）：全部功能可用
- 建议将不可用的按钮置灰或隐藏，并用 Tooltip 提示需要更高权限

### 7.6 错误处理

- Token 过期返回 HTTP 401 + `{"code": 401, "message": "..."}`
- 业务错误返回 `recode: 500` + `message` 字段
- 建议统一拦截 401 跳转登录页

---

## 8. 附录：URL 路径速查表

| 功能 | 方法 | 路径 | 权限 |
|------|------|------|------|
| 分页查用户 | POST | `/api/admin/user/page-select` | 55,77 |
| 批量更新用户信息 | POST | `/api/admin/user/update/user-role-status` | 77 |
| 批量删除用户 | POST | `/api/admin/user/delete` | 77 |
| 创建用户 | POST | `/api/admin/user/create` | 77 |
| 批量重置密码 | POST | `/api/admin/user/update/password` | 77 |
| 初始化头像昵称 | POST | `/api/admin/user/init-avatar-nickname` | 77 |
| 刷新权限缓存 | POST | `/api/admin/user/refresh-permission-cache` | 77 |
| 分页查作品 | GET | `/api/admin/works/page/{current}/{size}` | 55,77 |
| 批量更新作品审核 | POST | `/api/admin/works/update/approval-status` | 55,77 |
| 批量删除作品 | POST | `/api/admin/works/delete` | 77 |
| 批量更新作品标题 | POST | `/api/admin/works/update/work-title` | 55,77 |
| 分页查评论 | GET | `/api/admin/comments/page/{current}/{size}` | 55,77 |
| 批量更新评论审核 | POST | `/api/admin/comments/update/approval-status` | 55,77 |
| 批量删除评论 | POST | `/api/admin/comments/delete` | 77 |
| 分页查合集 | GET | `/api/admin/series/page/{current}/{size}` | 55,77 |
| 批量更新合集审核 | POST | `/api/admin/series/update/approval-status` | 55,77 |
| 批量删除合集 | POST | `/api/admin/series/delete` | 77 |
| 批量更新合集信息 | POST | `/api/admin/series/update/series-info` | 77 |
| 分页查审核记录 | GET | `/api/admin/audit-records/page/{current}/{size}` | 55,77 |
| 分页查待审核变更 | GET | `/api/admin/user-data-change/pending/{current}/{size}` | 55,77 |
| 批量审核数据变更 | POST | `/api/admin/user-data-change/review` | 55,77 |
| 分页查操作日志 | GET | `/api/admin/logs/page/{current}/{size}` | 77 |
| 登录 | POST | `/api/auth/login` | 公开 |
| 登出 | POST | `/api/auth/logout` | 需认证 |
