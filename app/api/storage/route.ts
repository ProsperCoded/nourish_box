import type { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse, NextRequest
 } from 'next/server';
import cloudinary from '.';
import multer from 'multer';
import { createEdgeRouter } from 'next-connect';
import streamifier from 'streamifier';

const upload = multer();

const apiRoute = createEdgeRouter<NextRequest, NextResponse>();

apiRoute.use(upload.single('file'));

apiRoute.post(async (req: NextRequest, res: NextResponse) => {
  try {
    const streamUpload = async (req: NextRequest) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'nourishbox_uploads' },
        (error, result) => {
          if (error) throw error;
          return result;
        }
      );
      
      streamifier.createReadStream(req.file.buffer).pipe(stream);
      return stream;
    };

    const result = await streamUpload(req);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiRoute;