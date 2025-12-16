# Database Schema Documentation

## Overview

This database schema is designed for an AI-powered classification service that processes text inputs and categorizes them using AI models. The schema supports workspace organization, job queuing with retry logic, HTTP request tracking, and detailed monitoring of AI API usage.

---

## Core Concepts

### Workspace
A logical grouping/namespace for organizing collections. Each API key is tied to a specific workspace, giving it access to that workspace's collections.

### Collection
A set of categories used for classification. For example, an "HR Issues" collection might contain categories like "Payroll", "Attendance", "Benefits", etc.

### Job Queue Pattern
All classification requests are processed asynchronously through a job queue system that supports:
- Retry logic with exponential backoff
- Priority handling
- Failed job tracking
- Individual HTTP request logging

---

## Schema Structure

### 1. Workspace & User Management

#### `workspaces`
Logical containers for organizing collections.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar [pk] | Unique workspace identifier |
| name | varchar | Workspace display name |
| description | text | Optional description |
| created_at | timestamp | Creation timestamp |

#### `users`
Users who own API keys and can access workspaces.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar [pk] | Unique user identifier |
| name | varchar | User's full name |
| email | varchar | User's email address |
| created_at | timestamp | Account creation timestamp |

#### `api_keys`
Authentication keys tied to specific workspaces.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar [pk] | Unique key identifier |
| user_id | varchar | References `users.id` |
| workspace_id | varchar | References `workspaces.id` |
| key_hash | varchar [unique] | Hashed API key for validation |
| key_last4 | varchar | Last 4 characters for display |
| name | varchar | Human-readable key name |
| is_active | boolean | Whether key is currently active |
| created_at | timestamp | Key creation timestamp |
| expires_at | timestamp | Optional expiration date |

**Key Design Decision:** Each API key is scoped to a single workspace. To access multiple workspaces, a user needs multiple keys.

---

### 2. Collections & Categories

#### `collections`
Named sets of categories for classification.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar [pk] | Unique collection identifier |
| workspace_id | varchar | References `workspaces.id` |
| name | varchar | Collection name (e.g., "HR Issues") |
| description | text | Optional description |
| created_at | timestamp | Creation timestamp |

**Example Collections:**
- "HR Issues" - Payroll, Attendance, Benefits
- "IT Support" - Network, Hardware, Software
- "Customer Feedback" - Complaint, Suggestion, Question

#### `collection_categories`
Individual categories within a collection. Supports nested/hierarchical categories.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar [pk] | Unique category identifier |
| collection_id | varchar | References `collections.id` |
| name | varchar | Category name |
| description | text | Category description |
| parent_id | varchar | References `collection_categories.id` for nesting |
| order_index | int | Display order within collection |
| created_at | timestamp | Creation timestamp |

**Example Structure:**
```
Collection: "HR Issues"
├── Payroll (parent)
│   ├── Salary deduction (child)
│   ├── Overtime payment (child)
│   └── Payslip request (child)
├── Attendance (parent)
│   ├── Missing clock-in/out (child)
│   └── Leave approval (child)
```

---

### 3. Input Processing

#### `inputs`
Raw text or data submitted for classification.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar [pk] | Unique input identifier |
| workspace_id | varchar | References `workspaces.id` |
| api_key_id | varchar | References `api_keys.id` - tracks which key was used |
| source | varchar | Origin: "api", "webhook", "ui", "batch" |
| raw_text | text | The actual text to classify |
| raw_metadata | json | Additional data sent with input |
| created_at | timestamp | Submission timestamp |

---

### 4. Job Queue System

#### `classification_jobs`
Job queue for processing classifications with retry support.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar [pk] | Unique job identifier |
| input_id | varchar | References `inputs.id` |
| collection_id | varchar | References `collections.id` - which collection to use |
| status | varchar | "pending", "processing", "completed", "failed", "retrying" |
| priority | int | Higher number = higher priority (default: 0) |
| attempt_count | int | Number of attempts made (default: 0) |
| max_attempts | int | Maximum retry attempts (default: 3) |
| error_message | text | Error details if failed |
| retry_after | timestamp | When to retry if status is "retrying" |
| scheduled_at | timestamp | When job should be picked up |
| started_at | timestamp | When processing began |
| completed_at | timestamp | When job finished |
| created_at | timestamp | Job creation timestamp |

**Status Flow:**
```
pending → processing → completed
                    ↓
                  failed
                    ↓
                retrying → processing → completed
                                    ↓
                                  failed (if max_attempts reached)
```

**Indexes:**
- `(status, scheduled_at)` - Efficient job queue queries
- `(input_id)` - Quick lookup by input

---

### 5. HTTP Request Tracking

#### `http_requests`
Detailed logging of every HTTP call to AI providers.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar [pk] | Unique request identifier |
| job_id | varchar | References `classification_jobs.id` |
| provider | varchar | "openai", "anthropic", "openrouter", etc. |
| model | varchar | Model used: "gpt-4o-mini", "claude-sonnet-4" |
| endpoint | varchar | Full API URL called |
| method | varchar | HTTP method (default: "POST") |
| headers | json | Request headers sent |
| request_body | json | Complete request payload |
| response_status | int | HTTP status code (200, 429, 500, etc.) |
| response_body | json | Complete response from API |
| response_headers | json | Response headers received |
| latency_ms | int | Request duration in milliseconds |
| error | text | Error message if request failed |
| created_at | timestamp | Request timestamp |

**Indexes:**
- `(job_id)` - Link requests to jobs
- `(provider, created_at)` - Analyze provider performance

**Why This Table?**
- **Debugging:** See exactly what was sent/received
- **Retry Analysis:** Track why requests failed
- **Provider Comparison:** Compare OpenAI vs Anthropic reliability
- **Cost Tracking:** Link to token usage
- **Prompt Engineering:** Analyze which prompts work best

---

### 6. Classification Results

#### `classifications`
Final classification results after successful processing.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar [pk] | Unique classification identifier |
| job_id | varchar | References `classification_jobs.id` |
| input_id | varchar | References `inputs.id` |
| category_id | varchar | References `collection_categories.id` - chosen category |
| confidence | float | AI's confidence score (0.0 - 1.0) |
| explaination | text | AI's reasoning for the choice |
| model_name | varchar | Model that made the classification |
| created_at | timestamp | Classification timestamp |

**Indexes:**
- `(input_id)` - Get classification for an input
- `(category_id)` - Analyze category usage

---

### 7. Cost & Performance Tracking

#### `model_token_usage`
Token consumption and cost for each AI API call.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar [pk] | Unique record identifier |
| http_request_id | varchar | References `http_requests.id` |
| prompt_tokens | int | Tokens in the prompt |
| completion_tokens | int | Tokens in the response |
| total_tokens | int | Sum of prompt + completion |
| cost_usd | float | Calculated cost in USD |
| created_at | timestamp | Tracking timestamp |

**Why Track Per HTTP Request?**
- Failed requests still consume tokens
- Retry attempts each cost money
- Need accurate cost attribution

**Cost Calculation Example:**
```
GPT-4o-mini pricing:
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens

Request with 1,000 prompt tokens, 200 completion tokens:
cost_usd = (1000 * 0.150 / 1_000_000) + (200 * 0.600 / 1_000_000)
         = $0.00015 + $0.00012
         = $0.00027
```

---

### 8. Feedback & Improvement

#### `classification_feedback`
User corrections and feedback on classification accuracy.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar [pk] | Unique feedback identifier |
| classification_id | varchar | References `classifications.id` |
| user_id | varchar | References `users.id` |
| correct_category_id | varchar | References `collection_categories.id` - user's correction |
| is_correct | boolean | Simple correct/incorrect flag |
| comment | text | Optional user explaination |
| created_at | timestamp | Feedback timestamp |

**Use Cases:**
- Track classification accuracy over time
- Build training dataset for fine-tuning
- Identify problematic categories
- Improve prompt engineering

---

### 9. Prompt Management

#### `prompt_templates`
Versioned prompt templates for A/B testing and iteration.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar [pk] | Unique template identifier |
| workspace_id | varchar | References `workspaces.id` |
| name | varchar | Template name |
| version | varchar | Version identifier (e.g., "v1.0", "v2.3") |
| template_text | text | The actual prompt template |
| is_active | boolean | Whether template is currently in use |
| created_at | timestamp | Creation timestamp |

#### `classification_prompts`
Links classifications to the prompt template used.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar [pk] | Unique record identifier |
| classification_id | varchar | References `classifications.id` |
| prompt_id | varchar | References `prompt_templates.id` |
| created_at | timestamp | Link timestamp |

**Why Version Prompts?**
- Compare accuracy across prompt variations
- Roll back if new prompt performs worse
- A/B test different approaches
- Track which prompts work best for which categories

---

### 10. Semantic Search

#### `vectors`
Vector embeddings for semantic search and RAG (Retrieval Augmented Generation).

| Column | Type | Description |
|--------|------|-------------|
| id | varchar [pk] | Unique vector identifier |
| input_id | varchar | References `inputs.id` |
| embedding | vector | Vector embedding (e.g., 1536 dimensions) |
| created_at | timestamp | Generation timestamp |

**Use Cases:**
- Find similar past classifications
- Pre-filter relevant categories before AI call
- Semantic deduplication
- Build knowledge base from past inputs

---

## Complete Flow Example

### Scenario: User submits "My payslip is missing for last month"

#### Step 1: Input Creation
```sql
INSERT INTO inputs (
  workspace_id, 
  api_key_id, 
  source, 
  raw_text
) VALUES (
  'ws_123',
  'key_456',
  'api',
  'My payslip is missing for last month'
);
-- Returns input_id: 'inp_789'
```

#### Step 2: Job Creation
```sql
INSERT INTO classification_jobs (
  input_id,
  collection_id,
  status,
  scheduled_at
) VALUES (
  'inp_789',
  'coll_hr_issues',
  'pending',
  NOW()
);
-- Returns job_id: 'job_abc'
```

#### Step 3: Worker Picks Up Job
```sql
-- Worker queries for next job
SELECT * FROM classification_jobs
WHERE status = 'pending' 
   OR (status = 'retrying' AND retry_after <= NOW())
ORDER BY priority DESC, scheduled_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED;

-- Update status
UPDATE classification_jobs 
SET status = 'processing', started_at = NOW()
WHERE id = 'job_abc';
```

#### Step 4: Make HTTP Request
```sql
INSERT INTO http_requests (
  job_id,
  provider,
  model,
  endpoint,
  request_body,
  response_status,
  response_body,
  latency_ms
) VALUES (
  'job_abc',
  'openrouter',
  'gpt-4o-mini',
  'https://openrouter.ai/api/v1/chat/completions',
  '{"messages": [...], "model": "gpt-4o-mini"}',
  200,
  '{"choices": [{"message": {"content": "..."}}]}',
  1247
);
-- Returns http_request_id: 'req_xyz'
```

#### Step 5a: Success - Create Classification
```sql
INSERT INTO classifications (
  job_id,
  input_id,
  category_id,
  confidence,
  explaination,
  model_name
) VALUES (
  'job_abc',
  'inp_789',
  'cat_payroll_payslip',
  0.94,
  'User is reporting a missing payslip for previous month',
  'gpt-4o-mini'
);

INSERT INTO model_token_usage (
  http_request_id,
  prompt_tokens,
  completion_tokens,
  total_tokens,
  cost_usd
) VALUES (
  'req_xyz',
  856,
  124,
  980,
  0.000203
);

UPDATE classification_jobs 
SET status = 'completed', completed_at = NOW()
WHERE id = 'job_abc';
```

#### Step 5b: Failure - Schedule Retry
```sql
UPDATE http_requests 
SET error = 'Rate limit exceeded', response_status = 429
WHERE id = 'req_xyz';

UPDATE classification_jobs 
SET 
  status = 'retrying',
  attempt_count = attempt_count + 1,
  error_message = 'Rate limit exceeded',
  retry_after = NOW() + INTERVAL '5 minutes'
WHERE id = 'job_abc';
```

---

## Query Examples

### Get All Pending Jobs
```sql
SELECT j.*, i.raw_text, c.name as collection_name
FROM classification_jobs j
JOIN inputs i ON j.input_id = i.id
JOIN collections c ON j.collection_id = c.id
WHERE j.status = 'pending'
ORDER BY j.priority DESC, j.scheduled_at ASC;
```

### Calculate Total Cost Per Workspace (Last 30 Days)
```sql
SELECT 
  w.name as workspace_name,
  COUNT(c.id) as total_classifications,
  SUM(t.cost_usd) as total_cost,
  AVG(t.cost_usd) as avg_cost_per_classification
FROM workspaces w
JOIN inputs i ON w.id = i.workspace_id
JOIN classification_jobs j ON i.id = j.input_id
JOIN http_requests h ON j.id = h.job_id
JOIN model_token_usage t ON h.id = t.http_request_id
WHERE i.created_at > NOW() - INTERVAL '30 days'
GROUP BY w.id, w.name;
```

### Find Failed Jobs That Exhausted Retries
```sql
SELECT j.*, i.raw_text, j.error_message
FROM classification_jobs j
JOIN inputs i ON j.input_id = i.id
WHERE j.status = 'failed' 
  AND j.attempt_count >= j.max_attempts;
```

### Classification Accuracy by Category
```sql
SELECT 
  cc.name as category_name,
  COUNT(c.id) as total_classifications,
  COUNT(CASE WHEN f.is_correct = true THEN 1 END) as correct_count,
  ROUND(
    COUNT(CASE WHEN f.is_correct = true THEN 1 END)::numeric / 
    COUNT(c.id)::numeric * 100, 
    2
  ) as accuracy_percentage
FROM collection_categories cc
JOIN classifications c ON cc.id = c.category_id
LEFT JOIN classification_feedback f ON c.id = f.classification_id
GROUP BY cc.id, cc.name
ORDER BY accuracy_percentage DESC;
```

### Provider Performance Comparison
```sql
SELECT 
  h.provider,
  h.model,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN h.response_status = 200 THEN 1 END) as successful,
  COUNT(CASE WHEN h.response_status != 200 THEN 1 END) as failed,
  ROUND(AVG(h.latency_ms)) as avg_latency_ms,
  ROUND(
    COUNT(CASE WHEN h.response_status = 200 THEN 1 END)::numeric / 
    COUNT(*)::numeric * 100, 
    2
  ) as success_rate
FROM http_requests h
WHERE h.created_at > NOW() - INTERVAL '7 days'
GROUP BY h.provider, h.model
ORDER BY success_rate DESC, avg_latency_ms ASC;
```

---

## Design Decisions & Rationale

### 1. Why Separate `http_requests` from `classification_jobs`?
**Reason:** One job can have multiple HTTP attempts (retries). Each attempt is a separate API call with its own cost, latency, and result.

### 2. Why Track `api_key_id` in `inputs`?
**Reason:** Audit trail - know which key was used for each classification. Useful for tracking usage per key and debugging access issues.

### 3. Why `workspace_id` in multiple tables?
**Reason:** Faster queries. Instead of joining through multiple tables, you can directly filter by workspace.

### 4. Why `order_index` in categories?
**Reason:** Categories might need specific display order in UI (e.g., most common issues first).

### 5. Why store full `request_body` and `response_body`?
**Reason:** Essential for debugging, prompt engineering, and understanding why classifications succeeded or failed.

---

## Scalability Considerations

### Indexes
Already included in schema for:
- Job queue queries (`status`, `scheduled_at`)
- Classification lookups (`input_id`, `category_id`)
- HTTP request analysis (`job_id`, `provider`, `created_at`)

### Partitioning (Future)
Consider partitioning these tables by date when data grows:
- `http_requests` (by `created_at`)
- `classification_jobs` (by `created_at`)
- `inputs` (by `created_at`)

### Archiving
Move completed jobs older than 90 days to archive tables to keep main tables fast.

---

## Migration Path

### Phase 1: MVP (Current Schema)
- Core tables for classification
- Job queue with retry
- HTTP request logging

### Phase 2: Enhanced Monitoring
- Add `classification_feedback`
- Add `prompt_templates`
- Implement A/B testing

### Phase 3: Advanced Features
- Add `vectors` for semantic search
- Implement caching layer
- Add rate limiting tables

---

## Security Notes

### API Key Storage
- Store `key_hash` (bcrypt/SHA256), never plaintext
- Only show `key_last4` to users
- Implement key rotation mechanism

### Data Privacy
- `raw_text` in `inputs` may contain PII
- Consider encryption at rest
- Implement data retention policies

### Rate Limiting
- Track requests per `api_key_id`
- Implement per-workspace limits
- Consider adding `rate_limits` table in Phase 2

---

## Next Steps

1. **Implement worker process** to consume job queue
2. **Add monitoring dashboard** for job status and costs
3. **Build admin UI** for managing collections/categories
4. **Set up alerting** for failed jobs exceeding threshold
5. **Implement caching** for identical inputs