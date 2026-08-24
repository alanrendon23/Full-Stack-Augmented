# 🧠 Capstone Project – Peer Review: AI-Augmented Full-Stack App

**Candidate Name:** **Date:** **Project Link (GitHub or Demo):** ---

### Reviewer 1 Omar Garcia (omar.b.garcia@aceenture.com)
| Trait | Rating (1-5) | Comments |
| :--- | :--- | :--- |
| **Full-Stack Integration**<br>*(Spring Boot + Angular connection, REST standards)* |5 | |
| **AI Feature ("The Magic")**<br>*(Effective integration of LLM API for UX value)* |5| |
| **Frontend Architecture**<br>*(Use of `@defer`, Signals, & Component design)* |5 | |
| **Testing Strategy**<br>*(Coverage, AI-generated unit tests, TDD evidence)* |5 | |
| **Copilot Utilization**<br>*(Refactoring quality, clean code, lack of "boilerplate")* |5 | |
| **Dev Environment**<br>*(Reproducibility via `devcontainer.json` & Codespaces)* |5 | |
| **Demo & Product Value**<br>*(Does it solve the problem? Is the UX intuitive?)* |5 | |

---

### Reviewer 2: Salgado, Vladimir Armando
| Trait | Rating (1-5) | Comments |
| :--- | :--- | :--- |
| **Full-Stack Integration**<br>*(Spring Boot + Angular connection, REST standards)* |5 | |
| **AI Feature ("The Magic")**<br>*(Effective integration of LLM API for UX value)* | 5| |
| **Frontend Architecture**<br>*(Use of `@defer`, Signals, & Component design)* |5 | |
| **Testing Strategy**<br>*(Coverage, AI-generated unit tests, TDD evidence)* | 5| |
| **Copilot Utilization**<br>*(Refactoring quality, clean code, lack of "boilerplate")* |5 | |
| **Dev Environment**<br>*(Reproducibility via `devcontainer.json` & Codespaces)* |5 | |
| **Demo & Product Value**<br>*(Does it solve the problem? Is the UX intuitive?)* |5 | |

---

### Reviewer 3 Alejandra Rodriguez (ale.rodriguez.diaz)
| Trait | Rating (1-5) | Comments |
| :--- | :--- | :--- |
| **Full-Stack Integration**<br>*(Spring Boot + Angular connection, REST standards)* | 4 | This project demonstrates a solid AI-augmented proof of concept/MVP with clear evidence of full-stack implementation, practical AI integration, and thoughtful use of AI-assisted development practices.  The strongest aspects are the end-to-end technical delivery, the integration of Gemini into a real user workflow, the use of testing, and the candidate’s ability to explain the architecture and development approach. The main areas to improve are related to production readiness, including security hardening, prompt sanitization, authentication and authorization, centralized error handling, persistent storage, resilience patterns for external AI calls, and operational monitoring. |
| **AI Feature ("The Magic")**<br>*(Effective integration of LLM API for UX value)* | 4 | The AI feature is a strong part of the solution because it provides clear user value through summaries, key concepts, flashcards, and enhanced descriptions integrated directly into the study-notes workflow. The use of Gemini, the preview-before-apply experience, and the iterative AI-assisted development approach show practical implementation and good engineering judgment. The main areas to improve are production readiness and maturity, especially prompt sanitization, structured AI response handling, explicit error behavior, authentication/authorization, reduced fragile parsing, and greater configurability of AI-generated content. |
| **Frontend Architecture**<br>*(Use of `@defer`, Signals, & Component design)* | 4 | The frontend base architecture is adecuate, with Angular standalone components composed effectively, signals used appropriately for state management, and a clear implementation of the dashboard, loading states, note management UI, backend service integration, and test coverage reporting. The use of Angular Material, PNPM, Jasmine, and Docker shows a modern frontend setup and good alignment with the broader full-stack solution. The main areas to improve are the use of @defer, which appears to behave more like a loading-state conditional than true lazy loading,  and the need to remove unused components such as todo-list and user-list to keep the codebase cleaner and more maintainable. |
| **Testing Strategy**<br>*(Coverage, AI-generated unit tests, TDD evidence)* | 4 | The testing strategy is strong for an MVP, with targeted unit tests across services, controllers, AI components, and frontend scenarios, especially the coverage of JSON double-encoding edge cases. The test suite demonstrates good attention to both backend and frontend behavior, but it should be cleaned up by removing duplicate or near-duplicate specs and adding coverage for NoteDetailComponent, which appears to be one of the most complex parts of the application. The main areas to improve are expanding beyond unit testing into integration tests, API contract tests, database integration tests, end-to-end backend validation, and stronger mocking strategies for LLM calls. |
| **Copilot Utilization**<br>*(Refactoring quality, clean code, lack of "boilerplate")* | 4 | The candidate described a thoughtful AI-assisted workflow based on small, focused prompts, iterative refinement, manual review of generated code, and restarting prompts when outputs drifted from expectations. The resulting code shows signs of effective AI-assisted development, including idiomatic, low-boilerplate implementation, while still keeping engineering judgment in the loop. The main areas to improve are around cleanup and final review discipline, particularly removing dead scaffolding and pruning duplicate or near-duplicate tests so generated output does not remain in the codebase without sufficient validation. |
| **Dev Environment**<br>*(Reproducibility via `devcontainer.json` & Codespaces)* | 5 | The development environment setup is strong, with a reproducible and well-documented devcontainer plus Docker Compose configuration, correct port forwarding, and useful preinstalled extensions that support the onboarding experience. The setup shows attention to consistency and developer productivity, making it easier to run and validate the application across environments. |
| **Demo & Product Value**<br>*(Does it solve the problem? Is the UX intuitive?)* | 4 | During the demo the candidate descibed the application purpose clearly, with a coherent walkthrough of the AI-enhanced study-notes workflow, architecture, implementation decisions, challenges, lessons learned, and future improvement areas. The product concept and AI value was clearly stated, and the code/template structure suggests a logical flow that supports the intended user experience. The main areas to improve are execution and polish, especially UX/UI issues surfaced during the live walkthrough, navigation clarity, empty and loading states, and visual consistency. |

---

### 🟢 Summary
- **Average Score:** - **Highlights:** - **Suggested Improvements:** ```
