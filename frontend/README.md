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

#### Login
1. User Login with username, password and oneTimeToken 
2. The system validates the user's credentials and enables access to the main work environment.
The system loads the user's recent operations and prepares the environment to begin a new customs declaration (DUA) generation process.

![Login_wireframe_early](/media/login_wireframe_early.png)

#### Generator Configuration
1. The user initiates a new DUA generation operation.
2. The system creates an internal record of the new customs operation and prepares the document processing workflow. The system prompts the user to specify the location of the documents that will be used as the source of information.

#### Select File Path
1. The user indicates the path to the folder containing the documents related to the customs operation.
2. The system accesses the specified folder and analyzes its contents. The system identifies all available files and determines which ones are compatible with the processing. The system registers the documents associated with the operation and prepares the process for reading each one.

#### Document processing
1. The user initiates the automatic processing of the detected documents.
2. The system executes a sequence of internal processes:
- Reading structured files (Excel and Word)
- Extracting text from PDF documents
- Optical character recognition (OCR) of scanned images

#### Preliminary generation of the DUA
1. The user requests the generation of the DUA document with the extracted information.
2. The system takes all the identified data and assigns it to the corresponding positions in the official DUA template.

#### Review of the extracted information
1. The user reviews each field of the generated document.

#### Information correction
1. The user manually modifies the values ​​that they consider incorrect or incomplete.

#### Generation of the final document
1. The user confirms that they wish to generate the final DUA document.
2. The system produces the final document in Word format using the official template.

#### Exporting document
1. The user requests to download the generated document.
2. The system delivers the DUA file ready to be reviewed externally or used in the customs declaration process.

#### Logout
1. The user completes the DUA generation operation.


### Wireframes
![Early_Wireframes](/media/wireframes_early.png)

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

## 1.4 Security

## 1.5 Layered Design

## 1.6 Design Patterns
