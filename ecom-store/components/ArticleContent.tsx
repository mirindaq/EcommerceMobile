import { Box, Text } from "@/components/ui";
import React, { useRef, useState } from "react";
import { WebView } from "react-native-webview";

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const [webViewHeight, setWebViewHeight] = useState(100);
  const webViewRef = useRef<WebView>(null);

  if (!content || !content.trim()) {
    return (
      <Box className="px-4 py-4">
        <Text className="text-gray-500 text-sm">
          Nội dung đang được cập nhật...
        </Text>
      </Box>
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body {
            margin: 0;
            padding: 0; /* Xóa padding body để React Native kiểm soát layout tốt hơn */
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #374151;
            background-color: #FFFFFF;
            overflow: hidden; /* Ẩn thanh cuộn của webview */
          }
          /* Container bọc nội dung để tạo margin/padding chuẩn */
          .content-wrapper {
            padding: 0 8px; 
          }
          img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 16px 0;
            display: block;
          }
          p { margin: 0 0 16px 0; }
          h1, h2, h3, h4, h5, h6 {
            margin: 24px 0 12px 0;
            font-weight: 700;
            color: #111827;
            line-height: 1.3;
          }
          /* Xóa margin-top của thẻ heading đầu tiên để sát lề trên */
          h1:first-child, h2:first-child, h3:first-child, p:first-child {
            margin-top: 0;
          }
          ul, ol { margin: 12px 0; padding-left: 24px; }
          li { margin: 6px 0; }
          a { color: #EF4444; text-decoration: none; }
          blockquote {
            margin: 16px 0;
            padding: 12px 16px;
            border-left: 4px solid #EF4444;
            background-color: #F9FAFB;
            border-radius: 4px;
            font-style: italic;
          }
          pre {
            background-color: #1F2937;
            color: #F9FAFB;
            padding: 12px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: monospace;
          }
        </style>
        <script>
          // Hàm gửi chiều cao về React Native
          function sendHeight() {
            var body = document.body;
            var html = document.documentElement;
            
            var height = Math.max( 
                body.scrollHeight, 
                body.offsetHeight, 
                html.clientHeight, 
                html.scrollHeight, 
                html.offsetHeight 
            );
            
            // Gửi message dạng JSON
            window.ReactNativeWebView.postMessage(JSON.stringify({ height: height }));
          }

          // Gửi height ngay khi load
          window.onload = sendHeight;
          
          // Gửi lại height khi ảnh load xong (quan trọng)
          window.addEventListener('load', sendHeight);
          
          // Observer để theo dõi thay đổi DOM (nếu có dynamic content)
          var resizeObserver = new ResizeObserver(entries => {
              sendHeight();
          });
          resizeObserver.observe(document.body);
        </script>
      </head>
      <body>
        <div class="content-wrapper">
          ${content}
        </div>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height && data.height > 0) {
        setWebViewHeight(data.height);
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  };

  return (
    <Box className="w-full bg-white">
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={{
          height: webViewHeight,
          backgroundColor: "transparent",
          opacity: 0.99,
        }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        scalesPageToFit={false}
        androidLayerType="hardware"
      />
    </Box>
  );
}
