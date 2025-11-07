import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('ERRO: MONGO_URI não definida no .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Conectado ao MongoDB.');
  } catch (error) {
    console.error('Falha ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}
