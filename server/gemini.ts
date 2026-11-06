import { GoogleGenAI } from '@google/genai';

// Initialize shared Google GenAI instance with required user-agent header
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Multi-turn chat message interface
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const SYSTEM_INSTRUCTION_VILLAGE = `Anda adalah "Asisten AI Cerdas SIPADLO" (Sistem Informasi Pelayanan Administrasi Desa Lolosoni, Kecamatan Gomo, Kabupaten Nias Selatan, Sumatera Utara).

Peran dan Tugas:
1. Memberikan informasi dan panduan akurat tentang seluruh layanan administrasi di Desa Lolosoni:
   - Surat Keterangan Domisili
   - Surat Pengantar KTP / KK (menuju Kantor Camat Gomo / Disdukcapil Kab. Nias Selatan di Teluk Dalam)
   - Surat Keterangan Usaha (SKU)
   - Surat Keterangan Tidak Mampu (SKTM)
   - Surat Keterangan Kelahiran / Kematian
   - Surat Pengantar Nikah (N1-N4)
   - Surat Keterangan Belum Menikah
   - Surat Keterangan Lainnya
2. Membantu warga merumuskan kalimat "Tujuan / Keperluan Permohonan" yang sopan, formal, dan sesuai kaidah tata naskah dinas.
3. Menjelaskan alur 4 langkah digital: Pendaftaran online -> Pemeriksaan oleh Perangkat Desa -> Verifikasi & Persetujuan Kades/Sekdes -> Penerbitan Surat Resmi ber-QR Code.
4. Menjawab dengan bahasa Indonesia yang santun, jelas, ramah, dan mengayomi khas budaya luhur Ono Niha (salam pembuka Ya'ahowu).
5. Jangan mengarang peraturan fiktif. Jika ada hal yang membutuhkan verifikasi fisik, sarankan warga untuk berkoordinasi langsung dengan Perangkat Desa di Kantor Desa Lolosoni, Kec. Gomo.`;

export async function handleVillageAssistantChat(
  history: ChatMessage[],
  newMessage: string
): Promise<{ reply: string }> {
  try {
    const ai = getGeminiClient();
    // Using gemini-3.8-flash for general multi-turn assistant tasks
    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_VILLAGE
      },
      history: history.map((msg) => ({
        role: msg.role,
        parts: msg.parts
      }))
    });

    const response = await chat.sendMessage({
      message: newMessage
    });

    return {
      reply: response.text || 'Maaf, saya tidak dapat memproses jawaban saat ini. Silakan ulangi kembali.'
    };
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    throw new Error(err?.message || 'Gagal berkomunikasi dengan layanan AI.');
  }
}

export async function handleGenerateHighQualityImage(params: {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:4' | '9:16';
  imageSize?: '1K' | '2K' | '4K';
}): Promise<{ imageUrl: string; textOutput?: string }> {
  try {
    const ai = getGeminiClient();
    const size = params.imageSize || '1K';
    const ratio = params.aspectRatio || '1:1';

    // Model gemini-3-pro-image supports 1K, 2K, 4K resolution picker
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image',
      contents: {
        parts: [
          {
            text: params.prompt
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: ratio,
          imageSize: size
        }
      }
    });

    let imageUrl = '';
    let textOutput = '';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType ?? 'image/png';
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        textOutput += part.text;
      }
    }

    if (!imageUrl) {
      throw new Error('Tidak ada data gambar yang dikembalikan oleh model AI.');
    }

    return { imageUrl, textOutput };
  } catch (err: any) {
    console.error('Gemini Image generation error:', err);
    throw new Error(err?.message || 'Gagal membuat gambar.');
  }
}
