const path = require("path");

class UploadController {
  static async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Choose an image to upload" });
      }
      return res.status(201).json({
        success: true,
        message: "Image uploaded",
        image: `/uploads/${path.basename(req.file.filename)}`,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to upload image" });
    }
  }
}

module.exports = UploadController;
