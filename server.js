const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Server çalışıyor!', timestamp: new Date() });
});

app.post('/chat', async (req, res) => {
  try {
    const { message, character } = req.body;
    
    if (!message || !character) {
      return res.status(400).json({ error: 'Message ve character gerekli' });
    }

    console.log(`${character.name} için mesaj: ${message}`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Sen bir Roblox hikaye oyununda ${character.name} isimli bir karaktersin. 
Kişiliğin: ${character.personality}

Oyuncu sana şunu söyledi: "${message}"

KURALLAR:
- Karakterine uygun yanıt ver
- Maksimum 2-3 cümle kullan
- Türkçe konuş
- Rol yapma işaretleri (*hareket*, vs.) kullanma
- Kısa ve akıcı yanıt ver`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    console.log(`AI Yanıtı: ${aiResponse}`);

    res.json({ 
      response: aiResponse,
      character: character.name 
    });

  } catch (error) {
    console.error('Hata:', error);
    res.status(500).json({ 
      error: 'Bir hata oluştu',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});
