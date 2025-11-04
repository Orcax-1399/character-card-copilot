use base64::{engine::general_purpose::STANDARD, Engine as _};
use png::{Decoder, Encoder};
use std::fs::File;
use std::io::{BufReader, BufWriter};
use std::path::Path;

/// PNG 元数据处理错误
#[derive(Debug)]
pub enum PngMetadataError {
    IoError(std::io::Error),
    PngDecodingError(png::DecodingError),
    PngEncodingError(png::EncodingError),
    Base64Error(base64::DecodeError),
    CharaDataNotFound,
    InvalidImageFormat,
}

impl std::fmt::Display for PngMetadataError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PngMetadataError::IoError(e) => write!(f, "IO错误: {}", e),
            PngMetadataError::PngDecodingError(e) => write!(f, "PNG解码错误: {}", e),
            PngMetadataError::PngEncodingError(e) => write!(f, "PNG编码错误: {}", e),
            PngMetadataError::Base64Error(e) => write!(f, "Base64解码错误: {}", e),
            PngMetadataError::CharaDataNotFound => write!(f, "PNG文件中未找到角色卡数据（chara元数据）"),
            PngMetadataError::InvalidImageFormat => write!(f, "无效的图片格式"),
        }
    }
}

impl From<std::io::Error> for PngMetadataError {
    fn from(err: std::io::Error) -> Self {
        PngMetadataError::IoError(err)
    }
}

impl From<png::DecodingError> for PngMetadataError {
    fn from(err: png::DecodingError) -> Self {
        PngMetadataError::PngDecodingError(err)
    }
}

impl From<png::EncodingError> for PngMetadataError {
    fn from(err: png::EncodingError) -> Self {
        PngMetadataError::PngEncodingError(err)
    }
}

impl From<base64::DecodeError> for PngMetadataError {
    fn from(err: base64::DecodeError) -> Self {
        PngMetadataError::Base64Error(err)
    }
}

/// PNG 元数据处理工具
pub struct PngMetadataUtils;

impl PngMetadataUtils {
    /// 从 PNG 文件中读取角色卡数据
    ///
    /// # 参数
    /// * `png_path` - PNG 文件路径
    ///
    /// # 返回
    /// * `Ok(String)` - Base64 解码后的 JSON 字符串
    /// * `Err(PngMetadataError)` - 错误信息
    pub fn read_character_data_from_png<P: AsRef<Path>>(
        png_path: P,
    ) -> Result<String, PngMetadataError> {
        let file = File::open(png_path)?;
        let reader = BufReader::new(file);
        let decoder = Decoder::new(reader);
        let reader = decoder.read_info()?;

        // 查找 tEXt 块中的 "chara" 关键词
        let text_chunks = &reader.info().uncompressed_latin1_text;
        for chunk in text_chunks {
            if chunk.keyword == "chara" {
                // 找到 chara 数据，进行 Base64 解码
                let base64_data = &chunk.text;
                let json_bytes = STANDARD.decode(base64_data)?;
                let json_str = String::from_utf8(json_bytes)
                    .map_err(|_| PngMetadataError::InvalidImageFormat)?;
                return Ok(json_str);
            }
        }

        Err(PngMetadataError::CharaDataNotFound)
    }

    /// 将角色卡数据写入 PNG 文件
    ///
    /// # 参数
    /// * `source_png_path` - 源 PNG 文件路径
    /// * `output_png_path` - 输出 PNG 文件路径
    /// * `character_json` - 角色卡 JSON 字符串
    ///
    /// # 返回
    /// * `Ok(())` - 成功
    /// * `Err(PngMetadataError)` - 错误信息
    pub fn write_character_data_to_png<P: AsRef<Path>>(
        source_png_path: P,
        output_png_path: P,
        character_json: &str,
    ) -> Result<(), PngMetadataError> {
        // 读取源 PNG 文件
        let file = File::open(source_png_path)?;
        let reader = BufReader::new(file);
        let decoder = Decoder::new(reader);
        let mut reader = decoder.read_info()?;

        let info = reader.info().clone();
        let width = info.width;
        let height = info.height;
        let color_type = info.color_type;
        let bit_depth = info.bit_depth;

        // 读取图像数据
        let mut buf = vec![0; reader.output_buffer_size()];
        let _info = reader.next_frame(&mut buf)?;

        // 创建输出文件
        let output_file = File::create(output_png_path)?;
        let w = BufWriter::new(output_file);

        let mut encoder = Encoder::new(w, width, height);
        encoder.set_color(color_type);
        encoder.set_depth(bit_depth);

        // 将 JSON 转为 Base64
        let base64_data = STANDARD.encode(character_json.as_bytes());

        // 添加 tEXt 块
        encoder.add_text_chunk(
            "chara".to_string(),
            base64_data,
        )?;

        let mut writer = encoder.write_header()?;
        writer.write_image_data(&buf)?;

        Ok(())
    }

    /// 检查 PNG 文件是否包含角色卡数据
    ///
    /// # 参数
    /// * `png_path` - PNG 文件路径
    ///
    /// # 返回
    /// * `Ok(bool)` - true 表示包含角色卡数据
    pub fn has_character_data<P: AsRef<Path>>(png_path: P) -> Result<bool, PngMetadataError> {
        let file = File::open(png_path)?;
        let reader = BufReader::new(file);
        let decoder = Decoder::new(reader);
        let reader = decoder.read_info()?;

        // 查找 tEXt 块中的 "chara" 关键词
        let text_chunks = &reader.info().uncompressed_latin1_text;
        for chunk in text_chunks {
            if chunk.keyword == "chara" {
                return Ok(true);
            }
        }

        Ok(false)
    }

    /// 从字节数组中读取角色卡数据
    ///
    /// # 参数
    /// * `png_bytes` - PNG 文件字节数组
    ///
    /// # 返回
    /// * `Ok(String)` - Base64 解码后的 JSON 字符串
    pub fn read_character_data_from_bytes(
        png_bytes: &[u8],
    ) -> Result<String, PngMetadataError> {
        let decoder = Decoder::new(png_bytes);
        let reader = decoder.read_info()?;

        // 查找 tEXt 块中的 "chara" 关键词
        let text_chunks = &reader.info().uncompressed_latin1_text;
        for chunk in text_chunks {
            if chunk.keyword == "chara" {
                // 找到 chara 数据，进行 Base64 解码
                let base64_data = &chunk.text;
                let json_bytes = STANDARD.decode(base64_data)?;
                let json_str = String::from_utf8(json_bytes)
                    .map_err(|_| PngMetadataError::InvalidImageFormat)?;
                return Ok(json_str);
            }
        }

        Err(PngMetadataError::CharaDataNotFound)
    }

    /// 将角色卡数据写入 PNG 字节数组
    ///
    /// # 参数
    /// * `source_png_bytes` - 源 PNG 文件字节数组
    /// * `character_json` - 角色卡 JSON 字符串
    ///
    /// # 返回
    /// * `Ok(Vec<u8>)` - 包含角色卡数据的 PNG 字节数组
    pub fn write_character_data_to_bytes(
        source_png_bytes: &[u8],
        character_json: &str,
    ) -> Result<Vec<u8>, PngMetadataError> {
        // 读取源 PNG 数据
        let decoder = Decoder::new(source_png_bytes);
        let mut reader = decoder.read_info()?;

        let info = reader.info().clone();
        let width = info.width;
        let height = info.height;
        let color_type = info.color_type;
        let bit_depth = info.bit_depth;

        // 读取图像数据
        let mut buf = vec![0; reader.output_buffer_size()];
        let _info = reader.next_frame(&mut buf)?;

        // 创建输出缓冲区
        let mut output_buf = Vec::new();
        {
            let mut encoder = Encoder::new(&mut output_buf, width, height);
            encoder.set_color(color_type);
            encoder.set_depth(bit_depth);

            // 将 JSON 转为 Base64
            let base64_data = STANDARD.encode(character_json.as_bytes());

            // 添加 tEXt 块
            encoder.add_text_chunk(
                "chara".to_string(),
                base64_data,
            )?;

            let mut writer = encoder.write_header()?;
            writer.write_image_data(&buf)?;
        }

        Ok(output_buf)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_base64_encode_decode() {
        let test_json = r#"{"name":"测试角色","description":"这是一个测试"}"#;
        let base64_data = STANDARD.encode(test_json.as_bytes());
        let decoded = STANDARD.decode(&base64_data).unwrap();
        let decoded_str = String::from_utf8(decoded).unwrap();
        assert_eq!(test_json, decoded_str);
    }
}
