# AGENTS.md

## Token 消耗控制

- 在不降低推理质量的前提下节省 token。
- 优先使用 `rg` 精准定位文件、符号、调用点，不做无意义的全仓库泛读。
- 只读取、分析、修改完成任务所必需的文件。
- 不重复解释已经确认过的背景信息。
- 中途汇报保持简短，只在发现关键结论、准备编辑文件、遇到风险或验证完成时说明。
- 终端输出只关注关键摘要、失败原因和必要上下文，避免展开完整长日志。
- 最终回答保持高信号，只说明改了什么、如何验证、剩余风险或后续建议。
- 如果任务需要更多上下文，应主动读取必要文件，而不是凭空猜测。

## 依赖管理

- 不管安装任何依赖包，都必须使用最新版本。
- 每一个将要安装或写入配置的包，都必须先执行：

  ```sh
  pnpm view <package-name> version
  ```

- 确认最新版本后，再安装或写入版本号。
- 如果项目是 monorepo，并且使用 `catalog` 管理依赖版本，也必须把每个包写成通过 `pnpm view <package-name> version` 确认后的最新版本。
- 不允许为了省事使用旧版本、模糊版本或未经确认的版本。
- 如果第三方依赖包要求指定版本严格按照其规定安装。

## 代码质量

- 使用 ESLint 和 `@antfu/eslint-config` 规范代码质量。
- 每完成一个功能，都必须保证：
  - ESLint 无报错。
  - ESLint 无警告。
  - TypeScript/Vue 类型检查无报错。
  - VS Code 不应出现红色波浪线错误。
- 如果当前环境无法确认 VS Code 诊断状态，需要说明已完成的命令验证，以及仍需用户在 VS Code 中确认的部分。
- 不允许留下“能跑就行”的脏实现。烂代码就是烂代码，必须当场指出并修掉。

## Vue 组件与业务代码

- 编写 Vue 组件或业务代码时，单个文件应尽量控制在 300 行以内。
- 如果文件超过 300 行，需要判断是否存在可以合理拆分的组件、组合式函数、工具函数或类型定义。
- 在语义逻辑清晰、业务内聚性强的情况下，可以允许最多约 50-100 行冗余，但必须基于具体场景判断。
- 不为了机械拆文件破坏上下文和业务语义。
- 优先保持组件职责清晰、数据流明确、交互状态可维护。

## TypeScript 规范

- TypeScript 单个文件应尽量控制在 300 行以内。
- 重复逻辑必须抽取为可复用函数、组合式函数或模块。
- 每个方法都要写规范化 JSDoc 注释。
- JSDoc 注释必须使用中文。
- 注释要解释方法用途、参数含义、返回值和关键业务约束，不写废话注释。
- 类型定义要准确，不使用无意义的 `any` 逃避类型问题。

## UI/UX 要求

- 实现功能时必须同时关注 UI/UX，不允许只把功能堆上去。
- 保证性能的前提下，加入必要的细节交互，例如清晰的状态反馈、加载状态、禁用态、错误提示、hover/focus 效果和合理过渡。
- 交互细节不能过度复杂，不能为了炫技影响可用性。
- 页面和组件要保持信息层级清晰、视觉密度合理、移动端与桌面端都可用。
- 文案、按钮、表单、空状态、错误状态都要符合真实用户使用场景。

## 性能优先

- 不要为了快速实现功能而忘记性能优先原则。
- 编写前端逻辑时，要避免无意义的重复渲染、重复计算、过大的响应式对象和不必要的深层监听。
- 编写数据处理逻辑时，要关注复杂度、缓存、懒加载、按需加载和资源释放。
- 可以参考相关 skill 的最佳实践。
- 如果性能和业务体验之间必须取舍，需要先告知用户取舍点和影响，再确认后执行。

## 优先使用的第三方库（最佳实践）
- 编写 Vue 相关 composables/组件 优先使用 `@vueuse/core` 库，仓库地址：https://github.com/vueuse/vueuse
- 编写 TypeScript 工具函数或通用方法 优先使用 `es-toolkit` 库，仓库地址：https://github.com/toss/es-toolkit
- 编写时间处理相关函数方法 优先使用 `dayjs` 库，仓库地址：https://github.com/iamkun/dayjs/
- 处理 HTTP 请求相关 优先使用 `axios` 库，仓库地址： https://github.com/axios/axios
- 生成随机 ID 复杂 ID 时优先使用 `nanoid` 仓库地址：https://github.com/ai/nanoid
- 处理 Vue 组件相关类型问题 优先使用 `vue-component-type-helpers` `@vue/shared` 库

## 子 agent 调用规则

- 根目录下的 `frontend-*-agent.md` 是专业子 agent 提示词文件。
- 当用户明确要求“调用子 agent”“让某某 agent 看一下”“并行审查”“多 agent 协作”时，主 agent 必须先读取对应子 agent 文件，再按其职责委派或执行。
- 如果用户没有明确要求委派，主 agent 可以读取对应子 agent 文件作为专业检查清单，但不默认启动并行子 agent。
- 多个子 agent 可以组合使用，但必须职责分离、输出合并，不允许重复审同一件事浪费 token。
- 子 agent 只能在自己的职责范围内给结论，不要越权修改代码或替其他 agent 做决策。
- 所有子 agent 都必须遵守本文件中的依赖管理、代码质量、开发服务和验证要求。

### 可用子 agent

- `frontend-error-quality-agent.md`：收集报错、类型检查、ESLint、测试、构建失败和代码质量问题。
- `frontend-architect-agent.md`：审查 Vue 3 + TypeScript 前端架构、模块边界、组件拆分、状态归属和类型模型。
- `frontend-ui-ux-visual-agent.md`：审查 UI/UX、视觉层级、布局、响应式、组件状态和可访问性。
- `frontend-library-docs-agent.md`：核对第三方工具库 / UI 库官方文档、版本、API、最佳实践代码，禁止编造。
- `frontend-engineering-agent.md`：审查前端工程化基建、包管理、脚本、TypeScript、ESLint、测试、构建、CI/CD 和质量门禁。
- `frontend-wheelwright-agent.md`：评估第三方组件 / 工具函数是否过重或不适合当前项目，并提供轻量、强类型、可测试的内部实现方案。

### 推荐触发方式

- “调用报错质量 agent 收集当前问题。”
- “让前端架构师 agent 审一下这个功能拆分。”
- “让 UI/UX agent 专门看一下视觉和交互。”
- “让第三方库文档 agent 查一下这个 UI 库的正确用法，不要编造。”
- “让工程化 agent 审一下项目基建和质量门禁。”
- “让造轮子 agent 判断这个第三方库是否太重，能不能自己实现。”
- “并行调用架构 agent 和 UI/UX agent 分别审查，然后合并结论。”

### 默认组合策略

- 新功能设计：先用 `frontend-architect-agent.md`，涉及界面时再用 `frontend-ui-ux-visual-agent.md`。
- 代码出错或质量不稳：先用 `frontend-error-quality-agent.md`，再按结果决定是否进入修复。
- 引入或升级第三方库：必须用 `frontend-library-docs-agent.md` 核对版本、官方文档和 API。
- 评估第三方组件 / 工具函数是否值得引入：先用 `frontend-library-docs-agent.md` 核对真实能力，再用 `frontend-wheelwright-agent.md` 判断复用、引入或内部实现。
- 调整脚手架、构建、lint、typecheck、test、CI 或包管理：必须用 `frontend-engineering-agent.md`。
- 页面体验差：先用 `frontend-ui-ux-visual-agent.md`，如果问题来自组件边界混乱，再用 `frontend-architect-agent.md`。

## 开发服务

- 不需要启动前端开发服务。
- 不需要执行 `pnpm run dev`、`npm run dev`、`yarn dev` 或类似长期运行的服务命令。
- 用户会自行测试功能。
- 可以执行 lint、typecheck、test、build 等一次性验证命令，但要避免不必要的长时间运行。

## 工作方式

- 修改前先理解现有代码结构和项目约定。
- 优先遵循项目已有模式，不随意引入新抽象。
- 编辑范围要和任务目标严格相关，避免无关重构。
- 如果发现现有代码质量很差，要直接指出问题，并给出修复方案。
- 如果发现用户已有改动，不要擅自回滚，要在其基础上继续工作。
- 完成功能后，必须进行必要验证，并在最终回复中说明验证结果。
