import { Box, Pressable, Text } from '@/components/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { WebView } from 'react-native-webview';

interface ProductDescriptionProps {
  description: string;
}

const COLLAPSED_HEIGHT = 300;
const EXPANDED_HEIGHT = 800;

export default function ProductDescription({ description }: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const webViewRef = useRef<WebView>(null);

  if (!description || !description.trim()) {
    return (
      <Box className="px-4 py-4">
        <Text className="text-gray-500 text-sm">Chưa có mô tả sản phẩm</Text>
      </Box>
    );
  }

  // Create HTML content with proper styling
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body {
            margin: 0;
            padding: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #1F2937;
            background-color: #FFFFFF;
          }
          img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 8px 0;
          }
          p {
            margin: 8px 0;
          }
          h1, h2, h3, h4, h5, h6 {
            margin: 16px 0 8px 0;
            font-weight: 600;
            color: #111827;
          }
          h1 { font-size: 24px; }
          h2 { font-size: 20px; }
          h3 { font-size: 18px; }
          h4 { font-size: 16px; }
          ul, ol {
            margin: 8px 0;
            padding-left: 24px;
          }
          li {
            margin: 4px 0;
          }
          a {
            color: #EF4444;
            text-decoration: none;
          }
          blockquote {
            margin: 16px 0;
            padding: 12px 16px;
            border-left: 4px solid #EF4444;
            background-color: #F9FAFB;
            border-radius: 4px;
          }
          code {
            background-color: #F3F4F6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
          }
          pre {
            background-color: #F3F4F6;
            padding: 12px;
            border-radius: 8px;
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
          }
          th, td {
            border: 1px solid #E5E7EB;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #F9FAFB;
            font-weight: 600;
          }
        </style>
        <script>
          window.addEventListener('load', function() {
            var height = Math.max(
              document.body.scrollHeight,
              document.body.offsetHeight,
              document.documentElement.clientHeight,
              document.documentElement.scrollHeight,
              document.documentElement.offsetHeight
            );
            window.ReactNativeWebView.postMessage(JSON.stringify({ height: height }));
          });
        </script>
      </head>
      <body>
        ${description}
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height) {
        setContentHeight(data.height);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const shouldShowExpandButton = contentHeight && contentHeight > COLLAPSED_HEIGHT;
  const currentHeight = isExpanded 
    ? (contentHeight ? Math.min(contentHeight + 50, EXPANDED_HEIGHT) : EXPANDED_HEIGHT)
    : COLLAPSED_HEIGHT;

  return (
    <Box className="mb-6">
      <Text className="text-gray-900 font-bold text-lg px-4">Mô tả sản phẩm</Text>
      <Box style={{ backgroundColor: '#FFFFFF' }}>
        <Box 
          style={{ 
            height: currentHeight, 
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent }}
            style={{ backgroundColor: 'transparent' }}
            scrollEnabled={isExpanded}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleMessage}
          />
          
          {/* Gradient overlay khi thu gọn */}
          {!isExpanded && shouldShowExpandButton && (
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 60,
                pointerEvents: 'none',
              }}
            />
          )}
        </Box>

        {/* Expand/Collapse Button */}
        {shouldShowExpandButton && (
          <Pressable
            onPress={() => setIsExpanded(!isExpanded)}
            className="px-4 py-3 items-center border-t border-gray-200"
          >
            <Box className="flex-row items-center">
              <Text className="text-red-500 font-semibold text-sm mr-2">
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
              </Text>
              {isExpanded ? (
                <ChevronUpIcon size={16} color="#EF4444" />
              ) : (
                <ChevronDownIcon size={16} color="#EF4444" />
              )}
            </Box>
          </Pressable>
        )}
      </Box>
    </Box>
  );
}

