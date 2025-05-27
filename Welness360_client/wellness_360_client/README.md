# 🌙 Wellness 360

<div align="center">
  <img src="public/wellness-360-logo.png" alt="Wellness 360 Logo" width="120" height="120" style="border-radius: 20px;">
  <p><strong>Your complete health and wellness companion</strong></p>
</div>

## ✨ Overview

Wellness 360 is a holistic health and wellness platform designed to help you track, manage, and improve your overall wellbeing. With intuitive features, personalized insights, and a sleek modern interface, taking care of your health has never been more seamless.

## 🚀 Features

- **🧠 Comprehensive Health Tracking** - Monitor nutrition, exercise, sleep, mood, and more
- **📊 Personalized Analytics** - Get insights tailored to your unique health journey
- **🌐 Cross-platform Access** - Access from any device with our responsive design
- **🔐 Secure & Private** - Your health data is encrypted and protected
- **🌙 Dark Mode Interface** - Easy on the eyes with our beautiful dark-themed UI
- **🤝 Community Support** - Connect with others on similar health journeys

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Modern UI with fluid animations and transitions
- **Deployment**: Vercel

## 🖥️ Screenshots

<div align="center">
  <img src="public/screenshot-dashboard.png" alt="Dashboard" width="80%">
  <p><em>Dashboard view with personalized health metrics</em></p>
</div>

## 🔍 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- An environment variable file with your API configurations

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/wellness_360_client.git

# Navigate to the project directory
cd wellness_360_client

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to see the application in action.

## 🌟 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help improve Wellness 360.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Special thanks to all the contributors who have helped shape Wellness 360
- Inspiration from the best health and wellness platforms around the world

---

<div align="center">
  <p>Made with ❤️ for a healthier tomorrow</p>
</div>

## Media Requirements

### Hero Section Media

1. **Local Background Video**
   - `/public/videos/fitness-video.mp4` - High-quality fitness video for the hero section background
   - This video was downloaded from YouTube (original source: https://www.youtube.com/watch?v=Sc7LUjbKBHw)
   - Benefits of using a local video file:
     - Faster loading times (no external API dependencies)
     - Works without an internet connection in development
     - Complete control over the video quality and compression
     - No YouTube branding or loading delays
   
2. **Fallback Image**
   - `/public/images/fitness-poster.jpg` - Static image that displays:
     - When the video is loading
     - If video playback fails
     - On mobile devices (for performance)
     - When JavaScript is disabled
     - Should match the video content for a seamless experience
   
3. **Implementation Details**
   - Direct video embedding using the HTML5 video tag with:
     - Autoplay and loop functionality
     - Muted by default (required for autoplay)
     - Responsive sizing with object-fit: cover
     - Error handling for graceful fallbacks
   - Mobile devices automatically receive the static image for better performance
   - A gradient overlay ensures text readability regardless of the background content