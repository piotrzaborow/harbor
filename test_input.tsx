import React, { useState } from 'react';
import { render } from '@opentui/react';

function App() {
  const [val, setVal] = useState('type here');
  return (
    <box flexDirection="column">
      <text>Value: {val}</text>
      <input value={val} onChange={setVal} focused={true} />
    </box>
  );
}

render(<App />);
