# VELOSaaS Classifieds Platform 🚀

This is a premium, modern full-stack Classifieds Platform (inspired by Gumtree & Facebook Marketplace). It features an elegant UI, real-time AI SEO Copywriting (Gemini API), secure chat/negotiation panels, vetted user listings, and an integrated WhatsApp support widget.

---

## 🇵🇰 GitHub Se Host Karne Ka Tarika (How to Host/Deploy via GitHub)

Aap is project ko asani se **GitHub** par push kar ke free host kar sakte hain. Kyunki isme Express backend aur React frontend dono hain, isko host karne ke behtareen tareeqay neeche diye gaye hain:

### Step 1: Code ko GitHub par push karein
1. Apne GitHub account par ek naya repository banayein.
2. Apne computer par terminal khol kar is project directory me ye commands run karein:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of VELOSaaS Classifieds"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPOSITORY_URL
   git push -u origin main
   ```

### Step 2: Hosting Platforms (Dono Options Available Hain)

#### Option A: Full-Stack Deploy (Recommended)
Kyunki isme Gemini AI aur back-end functionality hai, isko full-stack host karne ke liye **Render** ya **Railway** sabse behtar hain:
1. **Render.com** par free account banayein.
2. Naya **Web Service** banayein aur apne GitHub repository ko connect karein.
3. Settings me ye configure karein:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`
   - **Environment Variables:** `GEMINI_API_KEY` (apni Google AI Studio key add karein)

#### Option B: Netlify aur Vercel (Fast & Free)
Humne **Netlify Serverless Functions** setup kar diye hain! Aap simple 1-click se Netlify par deploy kar sakte hain:
1. **Netlify.com** par login karein aur **Import from GitHub** par click karein.
2. Apne repository ko select karein. Netlify automatic humari `netlify.toml` file read kar lega.
3. Environment variables me `GEMINI_API_KEY` add karein.
4. **Deploy Site** par click karein! Done! 🎉

---

## 🛠️ Local Development (Apne Computer Par Chalane Ka Tarika)

Agar aap isko apne computer par run karna chahte hain:

1. **Dependencies install karein:**
   ```bash
   npm install
   ```

2. **Environment File Setup:**
   Root folder me `.env` file banayein aur apni Gemini API key dalein:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. **Development Server Chalaein:**
   ```bash
   npm run dev
   ```
   Aapka app [http://localhost:3000](http://localhost:3000) par live ho jayega!

---

## ⭐️ Key Features Implemented:
* **Premium UI/UX:** Built with high-contrast Slate design guidelines, smooth transitions, and elegant typography.
* **WhatsApp Support Widget:** Integrated widget with live support on **+92 341 8417790** for quick assistance.
* **AI SEO Copywriter:** Generate rich, optimized ad descriptions with 1-click using Google Gemini AI.
* **Secure Chat Room:** Interactive negotiation panels for buyers and sellers.
* **Local Persistence:** Data saved locally in a JSON-based database for persistence.
