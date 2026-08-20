/**
 * Slottley App
 *
 * @format
 */

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import StackNav from './src/navigation/StackNav';

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StackNav />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
