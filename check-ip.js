import https from 'https';
import dns from 'dns';

console.log('🔍 Checking network connectivity...\n');

// Check current IP
https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const ip = JSON.parse(data).ip;
      console.log(`📍 Your current IP: ${ip}`);
      console.log(`🔗 Add this IP to Atlas: https://cloud.mongodb.com/v2#/org/YOUR_ORG/access/network`);
    } catch (e) {
      console.log('❌ Could not get IP address');
    }
  });
}).on('error', (e) => {
  console.log('❌ Network error:', e.message);
});

// Test DNS resolution
const testDNS = () => {
  console.log('\n🧪 Testing DNS resolution...');
  
  dns.resolve('cluster0.7zigksz.mongodb.net', (err, addresses) => {
    if (err) {
      console.log('❌ DNS resolution failed:', err.message);
      console.log('💡 Try: ipconfig /flushdns');
    } else {
      console.log('✅ DNS resolution successful:', addresses[0]);
    }
  });
};

setTimeout(testDNS, 1000);