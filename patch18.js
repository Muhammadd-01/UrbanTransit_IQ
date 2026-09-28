const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/LandingPage.jsx', 'utf8');

code = code.replace(
  '  useEffect(() => {',
  `  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'TOGGLE_THEME') {
        setIsDark(event.data.theme === 'dark');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {`
);

fs.writeFileSync('frontend/src/pages/LandingPage.jsx', code);
