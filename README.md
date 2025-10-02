# QGen Tab Planner V3

*Next-generation market research platform for the modern workforce*

## 🚀 Quick Start for Non-Coders

**Get this running on your laptop in 5 minutes!**

### Step 1: Install Required Software

Download and install these (in order):

1. **Node.js** - [Download here](https://nodejs.org/) (choose "LTS" version)
   - After installing, restart your computer

2. **Git** - [Download here](https://git-scm.com/downloads)
   - Use default settings during installation

### Step 2: Open Terminal

**Windows:**
- Press `Windows Key + R`
- Type `cmd` and press Enter

**Mac:**
- Press `Command + Space`
- Type `terminal` and press Enter

### Step 3: Download the Project

Copy and paste these commands **one at a time** into terminal:

```bash
git clone https://github.com/wcosgrove123/qgen-tab-planner.git
```

Press Enter. Wait for download to complete.

```bash
cd qgen-tab-planner
```

Press Enter.

### Step 4: Install Dependencies

```bash
npm install
```

Press Enter. This will take 2-3 minutes. You'll see lots of text scrolling - that's normal!

### Step 5: Set Up Your Environment

```bash
cp .env.example .env
```

Press Enter. This creates your configuration file.

### Step 6: Start the Application

```bash
npm run dev
```

Press Enter. You should see a message like "Server running at http://localhost:5173"

### Step 7: Open in Browser

Open your web browser and go to: **http://localhost:5173**

**🎉 You're done!** The application should now be running.

### Stopping the Application

In the terminal window, press `Ctrl + C` (Windows/Mac) to stop the server.

### Starting Again Later

Open terminal, then:

```bash
cd qgen-tab-planner
npm run dev
```

---

## 🆘 Troubleshooting

**"npm is not recognized"**
- Restart your computer after installing Node.js
- Or reinstall Node.js from [nodejs.org](https://nodejs.org/)

**"git is not recognized"**
- Restart your terminal after installing Git
- Or reinstall Git from [git-scm.com](https://git-scm.com/)

**Port already in use**
- Close other development servers
- Or the app will try a different port automatically

**Nothing happens after npm run dev**
- Make sure you're in the `qgen-tab-planner` folder
- Check that `npm install` completed without errors
- Try `npm install` again

---

## Overview

QGen Tab Planner V3 is a comprehensive market research platform designed to revolutionize how research companies operate in an AI-driven world. This passion project represents the future of market research workflow automation, from questionnaire design through to intelligent reporting and analysis.

### The Vision

This platform transforms traditional market research by:
- **Streamlining the entire research pipeline** from conception to delivery
- **Enabling AI-powered collaboration** throughout the research process
- **Automating complex data visualization** and report generation
- **Providing drag-and-drop simplicity** for enterprise-level complexity
- **Preparing for the workforce of tomorrow** with intelligent tooling

---

## Market Research Workflow Integration

QGen Tab Planner V3 supports the complete market research lifecycle:

```
📋 Questionnaire Design → 📊 Tab Plan → 📈 Banner Plan → 🔧 Dynata Coding →
📦 SPSS Data + Filled Plans → 🔍 Analysis → 📊 PowerPoint Reports
```

### Workflow Breakdown

1. **📋 Questionnaire Design**: Build sophisticated surveys with conditional logic, dynamic sourcing, and complex table structures
2. **📊 Tab Plan**: Define how data should be organized and netted for analysis
3. **📈 Banner Plan**: Create cross-tabulation blueprints for data visualization
4. **🔧 Dynata Integration**: Send structured specifications to coding partners
5. **📦 Data Return**: Receive SPSS files and filled tab/banner plans
6. **🔍 AI-Powered Analysis**: Intelligent pattern recognition and trend identification
7. **📊 Automated Reporting**: Drag-and-drop report generation with AI assistance

---

## Core Features

### 📋 Advanced Question Types

#### Standard Questions
- **📝 List/Items**: Single and multi-select with advanced option management
- **🔢 Numeric**: Input fields, ranges, and dropdown configurations
- **💬 Open Text**: Free-form text with length validation
- **📄 Text Elements**: Informational content (consent, instructions)

#### Enterprise Table System
*See [tableInstructions.md](./tableInstructions.md) for comprehensive documentation*

- **📊 Simple Tables**: Custom rows/columns with manual configuration
- **⭐ Likert Scales**: Agreement, sentiment, and satisfaction scales with T2B/B2B netting
- **🔄 Dynamic Sourcing**: Tables populated from previous question responses
- **📈 Multi-Matrix**: Complex dual-source table configurations
- **🎯 Conditional Logic**: Row/column display based on previous responses

#### Advanced Features
- **🔀 Conditional Logic**: Smart question display with progressive disclosure
- **🔗 Question Piping**: Dynamic text insertion from previous responses
- **📚 Question Library**: Reusable question templates with metadata
- **✅ Real-time Validation**: Comprehensive form validation with helpful feedback
- **📱 Responsive Design**: Works seamlessly across all device sizes

### 🛠️ Development Features

#### Question Builder
- **Drag-and-drop** question reordering
- **Live preview** of all question types
- **Smart defaults** and preset configurations
- **Bulk operations** for efficient question management

#### Data Management
- **Auto-save** functionality with conflict resolution
- **Version control** for questionnaire iterations
- **Export/Import** for questionnaire sharing
- **SPSS integration** preparation

---

## Technical Architecture

### Tech Stack
- **Frontend**: Vanilla JavaScript ES6+, HTML5, CSS3
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Build System**: Turbo monorepo
- **Development**: Node.js, npm workspaces
- **AI Integration**: Claude AI for intelligent assistance
- **Data Export**: SPSS integration, PowerPoint automation

### Project Structure
```
qgen-tab-planner/
├── apps/
│   └── web/                    # Main web application
│       ├── src/
│       │   ├── views/          # Page components
│       │   │   ├── project/    # Project management
│       │   │   │   └── editor/ # Question builder
│       │   │   ├── projects.js # Project dashboard
│       │   │   └── library/    # Question library
│       │   ├── lib/            # Utilities & helpers
│       │   ├── components/     # Reusable components
│       │   └── full_legacy_code.js # Legacy functionality
│       └── index.html          # Entry point
├── infra/
│   └── supabase/              # Database schema & migrations
│       ├── migrations/        # SQL migration files
│       ├── config.toml        # Supabase configuration
│       └── schema.sql         # Database schema
├── packages/                   # Shared utilities
├── services/                   # External integrations
├── scripts/                    # Build & deployment scripts
├── CLAUDE.md                   # Development patterns & solutions
├── tableInstructions.md        # Comprehensive table system guide
└── README.md                   # This file
```

---

## Advanced Setup (For Developers)

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- **Supabase CLI** (optional, for database management)
- **Git**

### Full Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/wcosgrove123/qgen-tab-planner.git
   cd qgen-tab-planner
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` if you have your own Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **Note:** The app works with default local development values if you don't change anything.

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   Open [http://localhost:5173](http://localhost:5173) in your browser

### Useful Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Future Vision: AI-Powered Reporting

### 🤖 AI Agent Collaboration

The next evolution of QGen Tab Planner V3 will feature intelligent AI agents that work alongside researchers throughout the entire project lifecycle:

#### During Questionnaire Design
- **Smart question suggestions** based on research objectives
- **Conditional logic optimization** for better respondent experience
- **Question flow analysis** to identify potential issues
- **Best practice recommendations** from research methodology

#### During Analysis Phase
- **Automated pattern recognition** in SPSS data
- **Trend identification** and significance testing
- **Anomaly detection** for data quality assurance
- **Insight generation** with supporting evidence

#### During Report Creation
- **Drag-and-drop visualization** builder with AI recommendations
- **Automated chart selection** based on data types and research goals
- **Story narrative generation** from data patterns
- **Executive summary creation** with key findings

### 📊 Intelligent Data Visualization

#### Drag-and-Drop Report Builder
- **Question-to-slide mapping**: Drag questions directly onto presentation slides
- **Smart visualization selection**: AI chooses optimal chart types
- **Dynamic filtering**: Show/hide data points interactively
- **Real-time data binding**: Live connection to SPSS results

#### Advanced Visualization Types
- **T2B/B2B boxes** with automated netting
- **Cross-tabulation matrices** with significance testing
- **Trend analysis** with predictive modeling
- **Demographic overlays** with smart segmentation

#### PowerPoint Automation
- **Template-based generation**: Brand-consistent report layouts
- **Automated slide population**: Data-driven content creation
- **Interactive presentations**: Click-through data exploration
- **Export optimization**: Print and digital format preparation

---

## Enterprise Table System

QGen Tab Planner V3 features a sophisticated table system designed for complex market research needs:

### Table Types Overview
- **Simple Tables**: Basic custom grids for straightforward data collection
- **Likert Scales**: Agreement and sentiment scales with built-in netting
- **Dynamic Sourcing**: Tables that adapt based on previous responses
- **Multi-Matrix**: Complex dual-source configurations
- **Conditional Tables**: Enterprise-level conditional display logic

*For detailed documentation, see [tableInstructions.md](./tableInstructions.md)*

### SPSS Integration
All table types are designed with SPSS export in mind:
- **Variable mapping** for seamless data integration
- **T2B/B2B net calculations** built into tab plans
- **Cross-tabulation support** for banner plan integration
- **Complex conditional logic** preserved in data export

---

## Development Guidelines

### Code Patterns
See [CLAUDE.md](./CLAUDE.md) for detailed development patterns including:
- **Event handling** best practices to prevent dropdown issues
- **Re-rendering optimization** for performance
- **Question type implementation** checklists
- **Validation patterns** and form handling

### Database Management
- **Migration-first approach**: All schema changes through migrations
- **Data integrity**: Comprehensive constraints and validation
- **Performance optimization**: Indexed queries for large datasets
- **Backup strategy**: Automated backups with point-in-time recovery

---

## Contributing

This is currently a private passion project, but the architecture is designed for future team collaboration:

### Development Process
1. **Feature Planning**: Document new features in relevant `.md` files
2. **Implementation**: Follow patterns established in CLAUDE.md
3. **Testing**: Comprehensive validation of all question types
4. **Documentation**: Update relevant documentation files

### Code Standards
- **ES6+ JavaScript**: Modern syntax and features
- **Modular Architecture**: Clear separation of concerns
- **Performance First**: Optimized rendering and data handling
- **User Experience**: Intuitive interfaces for complex functionality

---

## Deployment

### Production Build
```bash
# Build optimized version
npm run build

# Preview production build
npm run preview
```

### Environment Configuration
- **Development**: Local Supabase instance
- **Staging**: Shared Supabase project for testing
- **Production**: Dedicated Supabase project with backups

---

## License

This project represents a passion-driven evolution of market research tooling. All rights reserved.

---

## Roadmap

### V3.1: Enhanced Question Builder
- [ ] Advanced conditional logic interface
- [ ] Improved question library with AI categorization
- [ ] Bulk question operations and templates

### V3.2: AI Integration Foundation
- [ ] AI agent architecture implementation
- [ ] Smart suggestion engine for question design
- [ ] Automated validation and optimization

### V3.3: Reporting Revolution
- [ ] Drag-and-drop report builder
- [ ] SPSS data integration and visualization
- [ ] AI-powered insight generation

### V3.4: Enterprise Features
- [ ] Advanced table conditional logic
- [ ] Multi-user collaboration tools
- [ ] Client portal and sharing capabilities

### V3.5: Full AI Collaboration
- [ ] Complete AI agent integration
- [ ] Automated report generation
- [ ] Predictive analytics and trend forecasting

---

*QGen Tab Planner V3 - Transforming market research for the AI-driven future*

**[Visit GitHub Repository](https://github.com/wcosgrove123/qgen-tab-planner)**
