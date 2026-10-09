# छठ पूजा (Chhath Puja) — Interactive Cinematic Digital Experience

A premium, emotional, and interactive digital **Chhath Puja** experience built with modern HTML5, CSS3, and JavaScript.

---

## 🌟 Key Features

### 1. Interactive Chhath Puja Thali (Centerpiece)
- **Natural Spring Physics Engine**: Follows mouse cursor on desktop and finger touch on mobile with realistic inertia, damping, and subtle velocity-based 3D rotation (`rotateX`, `rotateY`, `rotateZ`).
- **Dynamic Live Flickering Flame**: Positioned precisely on the brass diya in the plate with animated flame core, inner glow, and warmth pulses.
- **Visual Feedback on Grab**:
  - Scales up smoothly (1.07x).
  - Radiates a soft golden aura (`#FFB830`).
  - Dynamic water reflection and soft shadow below the thali react in real-time.
  - Golden stardust particles and marigold petal flecks emit dynamically based on velocity.
  - Damped harmonic spring gently returns the thali to center upon release.
- **Mobile Optimized**: `touch-action: none` prevents accidental page scrolling while dragging on touchscreens.

### 2. Motion-Triggered Devotional Audio & Song Changing
- **Plays ONLY When Moving the Thali**: As you move/drag the thali, the devotional song immediately flows and fades in. If you stop moving or release the thali, the song gracefully fades out and pauses.
- **Change Song Anytime (`🎵 भजन बदलें`)**:
  - Click the **"भजन बदलें"** button in the top navigation or near the thali.
  - Choose from iconic built-in Chhath songs:
    1. **"छठी मैया बुलाये"** — विशाल मिश्रा व कौशल किशोर
    2. **"जोड़े जोड़े फलवा"** — पवन सिंह (T-Series)
    3. **"कांच ही बांस के बहंगिया, बहंगी लचकत जाए"** — पारंपरिक बांसुरी व लोकधुन
    4. **"उग हे सुरुज देव, भेल अरघ के बेर"** — प्रातःकालीन अर्घ्य व शंखनाद
    5. **"वैदिक नाद"** — शुद्ध तानपुरा, मंदिर की घंटियाँ व गंगाजल तरंग
  - **Custom Song Upload**: Choose any MP3/audio file directly from your computer or phone (`📁 अपनी डिवाइस से छठ गीत चुनें`) to play it in real time while moving the thali!
  - **Playback Mode Selection**: Switch between **"केवल थाली घुमाने पर" (Only When Moving Thali - Default)** and **"निरंतर पृष्ठभूमि संगीत" (Continuous Play)**.

### 3. Visual & Cinematic Design
- **Curated Palette**:
  - Background: `#120B08`
  - Warm Ivory: `#F5EBD0`
  - Maroon: `#8F1717`
  - Gold: `#A86600` / `#D4A347` / `#F5CD79`
  - Saffron & Amber accents: `#EA580C` / `#D97706`
  - Strict avoidance of generic templates, flat colors, or cartoon elements.
- **Atmospheric Environment**:
  - Cinematic Ganges river ghat at sunrise with sun god rays.
  - Floating river diyas drifting gently on water with sinusoidal bobbing and light reflections.
  - Drifting morning river mist and floating marigold flower petals.

### 4. Cultural & Spiritual Sections
- **Hero Stage**: Interactive Chhath Puja Thali, Hindi & English drag guidance badge, and quick ritual pills (🔔 घंटी, 🌸 पुष्प, ☀️ अर्घ्य, 🪔 दीप).
- **छठ पूजा की पावन भावना**: Cinematic visual of devotees offering Arghya at dawn in waist-deep water, detailing the philosophy of worshipping both the setting and rising sun, social equality, and pure nature communion.
- **चार दिवसीय महापर्व**: Interactive cards explaining the 4 sacred days:
  1. *नहाय-खाय* (Nahay-Khay)
  2. *खरना* (Kharna)
  3. *संध्या अर्घ्य* (Sandhya Arghya)
  4. *उषा अर्घ्य व पारण* (Usha Arghya & Paran)
- **महाप्रसाद व सामग्रियाँ**: Symbolism of Thekua, Bamboo Soop & Daura, Nariyal, Sugarcane, Dabh lemon, and Brass Diya.
- **पवित्र गंगा में दीप समर्पण**: Dedicated interactive digital river stream where users can enter their family's name, choose a prayer, and launch a floating Diya onto the sacred waters.
- **भावुक समापन व शुभकामनाएँ**: Floating Diya blessing interaction, Surya Gayatri Mantra, and 1-click greeting sharing.

---

## 🚀 How to Run & View

The local development server is running and accepting connections:

```
http://localhost:3000
```

Open `http://localhost:3000` in any web browser (Chrome, Edge, Firefox, Safari, Brave).

### Replacing the Audio File
To use your own devotional Chhath song (e.g. Sharda Sinha's iconic classics):
1. Place your MP3 file at: `chhath-puja.mp3` (in the project root).
2. Refresh the browser. The player will automatically stream your local file!
