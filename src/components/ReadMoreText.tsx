import React, { useState } from 'react';
import { View, Text, StyleProp, TextStyle, TextLayoutEvent } from 'react-native';

interface ReadMoreTextProps {
  text: string;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
  moreLabel?: string;
  lessLabel?: string;
}

const ReadMoreText = ({
  text,
  numberOfLines = 3,
  style,
  linkStyle,
  moreLabel = 'Read More',
  lessLabel = 'Read Less',
}: ReadMoreTextProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [measured, setMeasured] = useState(false);

  const onMeasureLayout = (e: TextLayoutEvent) => {
    if (measured) return;
    setMeasured(true);
    setIsTruncated(e.nativeEvent.lines.length > numberOfLines);
  };

  return (
    <View>
      {/* Off-screen copy, unclipped, used only to measure the true line count. */}
      {!measured && (
        <Text
          style={[style, { position: 'absolute', opacity: 0, left: 0, right: 0, top: 0 }]}
          onTextLayout={onMeasureLayout}
        >
          {text}
        </Text>
      )}

      <Text style={style} numberOfLines={expanded ? undefined : numberOfLines}>
        {text}
      </Text>

      {/* Kept on its own line rather than appended inline — RN's numberOfLines
          truncation can silently drop trailing nested text when there's no
          room left on the last visible line, which swallowed the link. */}
      {isTruncated && (
        <Text style={linkStyle} onPress={() => setExpanded(v => !v)}>
          {expanded ? lessLabel : moreLabel}
        </Text>
      )}
    </View>
  );
};

export default ReadMoreText;
