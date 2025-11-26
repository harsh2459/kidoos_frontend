import { useEffect, useState } from 'react';

export default function PopupTest() {
  const [data, setData] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    console.log('PopupTest mounted!');
    
    fetch('/api/settings/popup/active?userType=new&page=all')
      .then(r => r.json())
      .then(d => {
        console.log('API Response:', d);
        setData(d);
        if (d.ok && d.popup) {
          setTimeout(() => setShow(true), 1000);
        }
      })
      .catch(e => console.error('API Error:', e));
  }, []);

  if (!show || !data?.popup) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      zIndex: 9999,
      maxWidth: '500px'
    }}>
      <button 
        onClick={() => setShow(false)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          cursor: 'pointer'
        }}
      >
        ✕
      </button>
      
      <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
        {data.popup.title}
      </h2>
      
      <p style={{ marginBottom: '20px' }}>
        {data.popup.description}
      </p>
      
      {data.popup.product && (
        <div style={{ marginBottom: '20px' }}>
          <h3>{data.popup.product.title}</h3>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#4F46E5' }}>
            ₹{data.popup.product.price}
          </p>
        </div>
      )}
      
      <button style={{
        width: '100%',
        padding: '12px',
        background: '#4F46E5',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer'
      }}>
        {data.popup.ctaText}
      </button>
    </div>
  );
}
