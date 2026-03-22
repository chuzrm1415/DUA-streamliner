# Frontend Desing

## 1.1 Technology Stack
- **Application Type:** Server-Side Rendering (SSR) Web App + Client-side interactivity
- **Web framework:** Next.js version 15.x
- **UI Library:** React version 19.x
- **Language:** TypeScript 5.9.x
- **Component Library:** Material UI 6.x
- **Styling:** Tailwind CSS 4.x
- **State management:** Zustand 5.x
- **Data fetching:** TanStack Query 5.x
- **Forms:** React Hook Form 7.x
- **Validation:** Zod 4.x
- **File upload:** React Dropzone 14.x
- **Document preview:**
    - PDF viewer: react-pdf
    - Image preview: native browser APIs
- **Unit testing:** Jest 30.x
- **Component testing:** React Testing Library 15.x
- **E2E testing:** Playwright 1.58.x
- **Authentication:** OAuth 2.0 / OpenID Connect
    - Library: NextAuth.js 5.x
- **Linter:** ESLint 10.x
- **Formatter:** Prettier 3.x
- **Git hooks:** Husky 9.x
- **Cloud provider:** Microsoft Azure
- **Frontend hosting:** Azure App Service
- **CI/CD:** Azure DevOps Pipelines
- **Environments:** development / staging / production
- **Monitoring:** Azure Application Insights

## 1.2 UX UI analysis

### Core Business Process

#### 1. User Authentication
- The user enters their username and password on the login screen.
- The system validates the credentials and grants access to the main dashboard upon successful authentication.
- If authentication fails, the system displays an error message.

#### 2. Action Selection
- The user initiates a new DUA generation process by clicking the “Generate DUA” button.
- The system navigates to the document input interface.

#### 3. Document Source Selection
- The user selects or uploads a folder containing the required documents.
- The system validates the folder contents and checks for supported file formats.

#### 4. Document Processing
- The user starts the document processing operation.
- The system performs:
    - Reading structured files (Excel and Word).
    - Extracting text from PDF documents.
    - Optical Character Recognition (OCR) on scanned images.
- The system displays a processing status indicator (e.g., progress bar or loading state)

#### 5. Preliminary DUA Generation
- The system generates a preliminary DUA document using the extracted data.
- The document is displayed with visual confidence indicators:
    - Green: High confidence
    - Yellow: Medium confidence
    - Red: Requires review

#### 6. Review and Correction
- The user reviews the generated DUA fields.
- The user can manually edit incorrect or incomplete information.
- The system may highlight inconsistencies or missing required fields.

#### 7. Final DUA Generation
- The user confirms the final generation of the DUA.
- The system validates all required fields before proceeding.
- The system generates the final document using the official template.

#### 8. Document Export
- The user requests to download the generated document.
- The system provides available download options (e.g., Word format).
- The document is downloaded to the user’s device

#### 9. Session Continuation or Logout
- The user may:
    - Start a new DUA generation process, or
    - Log out of the system.


### Wireframes
#### Login
![Login Page](./media/login_page.png)

#### Main Page
![Dashboard](./media/dashboard_page.png)

#### Select Folder
![Select Folder](./media/selectfolder_page.png)

#### Document Preview
![Document Preview](./media/DUApreview_page.png)

### UX Test Results
- Escoger alguna app para ejecutar el ux test usando esos wireframes
- El test se lo van a aplicar de forma remota compartiendo un url a 3 estudiantes o amigos 
- Eso va a generar un reporte de resultados 

- crear un markdown table con los resultados
- Evidencias

![Persona1](/media/per1.jpg)
![Persona2](/media/per2.jpg)
![Persona3](/media/per3.jpg)

/heatmap
![url-heapmap](/media/heatmap.jpg)




## 1.3 Component Design Strategy

### Design Approach
The frontend component design follows the Atomic Design methodology, enabling the construction of complex interfaces from small, reusable building blocks.

- Atoms: Basic UI elements (buttons, inputs, labels, icons)
- Molecules: Groups of atoms (form fields, input groups, file selectors)
- Organisms: Complex UI sections (navigation sidebar, document preview panel, DUA form sections)
- Templates / Pages: Full layouts (dashboard, document processing flow, DUA preview page)

### Component Reusability Strategy
- Component modularization using React functional components
Separation of:
    - UI logic (presentation components)
    - Business logic (custom hooks)
- Creation of shared components, such as: Buttons, Input fields, Status indicators, File upload components.
- Use of props and composition patterns to make components flexible and configurable

### State and Logic Encapsulation
- Local UI state is handled with Zustand
- Server state and asynchronous data are handled with TanStack Query
- Custom hooks are used to encapsulate logic (e.g., useDUAProcessing, useFileUpload)

### Styling Strategy and Centralization
- Component-level styling:
    - Each component has its own styling file or configuration
- Technologies used:
    - Material UI for base components and design system
    - Tailwind CSS for layout and spacing utilities
- Styling rules:
    - Material UI → UI components (buttons, inputs, dialogs)
    - Tailwind → layout (grid, spacing, responsiveness)
- Naming conventions:
    - CSS class pattern: ComponentName-element-modifier
- Use of theme configuration (MUI Theme) to centralize:
    - Colors (including confidence indicators)
    - Typography
    - Spacing scale

### Internationalization (i18n)
- Language switching is not supported for this project

### Responsiveness Strategy
- Tailwind CSS responsive utilities (breakpoints)
- Material UI responsive components and grid system

- Design principles:

    - Mobile-first approach
    - Flexible layouts using: flex, grid.
- Units: Relative units (rem, %) instead of fixed pixels
- Key UI adaptations:
    - Sidebar collapses on small screens
    - Document preview switches from split view to stacked layout
    - Tables become scrollable

### Accessibility Considerations
- Accessibility is not taken into account in this project.

## 1.4 Security

### Authentication Strategy
- Authentication is handled using:
    - NextAuth.js (v5.x) integrated with Next.js App Router
    - Identity provider: Microsoft Azure via Azure Entra ID (formerly Azure Active Directory)
- Supported mechanisms:
    - Single Sign-On (SSO) via Azure Entra ID
    - OAuth 2.0 / OpenID Connect (OIDC) flows
    - Multi-Factor Authentication (MFA) enforced by Azure Entra ID

## 1.5 Layered Design

## 1.6 Design Patterns
