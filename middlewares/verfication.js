import { verifySignature } from "@upstash/qstash/nextjs";

export const verifyQStashSignature = async (req, res, next) => {
    try {
        const signature = req.headers['upstash-signature'];
        
        const isValid = await verifySignature({
            signature,
            body: JSON.stringify(req.body),
            currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
            nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY
        });

        if (!isValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid signature' 
            });
        }
        next();
    } catch (error) {
        console.error('Signature verification failed:', error);
        res.status(401).json({ 
            success: false, 
            error: 'Signature verification failed' 
        });
    }
}