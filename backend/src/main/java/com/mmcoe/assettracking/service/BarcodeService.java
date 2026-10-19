package com.mmcoe.assettracking.service;

import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.oned.Code128Writer;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.EnumMap;
import java.util.Map;

@Service
public class BarcodeService {

    public byte[] generateBarcode(String text, int width, int height) {
        try {
            Code128Writer writer = new Code128Writer();
            BitMatrix matrix = writer.encode(text, BarcodeFormat.CODE_128, width, height);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate barcode for " + text, e);
        }
    }

    public byte[] generateQrCode(String text, int width, int height) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(text, BarcodeFormat.QR_CODE, width, height);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code for " + text, e);
        }
    }

    public String decodeBarcode(InputStream inputStream) {
        try {
            BufferedImage image = ImageIO.read(inputStream);
            if (image == null) {
                throw new IllegalArgumentException("Could not read image file");
            }
            LuminanceSource source = new BufferedImageLuminanceSource(image);
            BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));

            Map<DecodeHintType, Object> hints = new EnumMap<>(DecodeHintType.class);
            hints.put(DecodeHintType.TRY_HARDER, Boolean.TRUE);

            Result result = new MultiFormatReader().decode(bitmap, hints);
            return result.getText();
        } catch (NotFoundException e) {
            throw new RuntimeException("No barcode or QR code found in uploaded image", e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decode barcode: " + e.getMessage(), e);
        }
    }
}
