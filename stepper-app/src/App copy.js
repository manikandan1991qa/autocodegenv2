import React, { useState } from 'react';

const StepperHeader = () => (
  <div style={{ backgroundColor: 'red', color: 'white', padding: '1rem' }}>
    <h1 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>TITLE - Comes Here</h1>
  </div>
);

const Stepper = ({ step }) => {
  const steps = ['Step 1', 'Step 2', 'Step 3'];

  const getStepStyle = (index) => {
    const isActive = index <= step;
    return {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: isActive ? '#007bff' : '#6c757d',
      color: 'white',
      padding: '0.5rem 1rem',
      clipPath: 'polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)',
      marginRight: index < steps.length - 1 ? '0.5rem' : '0',
      fontWeight: 'bold',
      minWidth: '100px',
      justifyContent: 'center',
      position: 'relative',
    };
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
      {steps.map((label, index) => (
        <div key={index} style={getStepStyle(index)}>
          <div>{index + 1}</div>
          <div style={{ marginLeft: '0.5rem' }}>{label}</div>
        </div>
      ))}
    </div>
  );
};

const Page1 = ({ onImport }) => (
  <div style={{ display: 'flex', padding: '1rem' }}>
    <div style={{ flex: 1, paddingRight: '1rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Title1</h2>
    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                <ImportFromSwagger onReset={clearAll} onData={handleData} />
            </div>
      <p style={{ color: '#1d4ed8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
        Note** - Import from swagger will open a popup and on selecting end point, it should go to page 2 with details pre filled
      </p>
      <div
        style={{
          border: '1px solid black',
          padding: '2rem',
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '2rem',
        }}
      >
        Some Welcome Text
        <div style={{ fontSize: '0.875rem' }}>(with some effects)</div>
      </div>
    </div>
    <div style={{ flex: 1 }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Title 2</h2>
      <input
        placeholder="Enter service name"
        style={{ border: '1px solid #ccc', padding: '0.5rem', width: '100%', margin: '0.5rem 0' }}
      />
      <input
        placeholder="/objects"
        style={{ border: '1px solid #ccc', padding: '0.5rem', width: '100%', margin: '0.5rem 0' }}
      />
      <select style={{ border: '1px solid #ccc', padding: '0.5rem', width: '100%', margin: '0.5rem 0' }}>
        <option>GET</option>
        <option>POST</option>
        <option>PUT</option>
        <option>DELETE</option>
      </select>
    </div>
  </div>
);

const Page2 = ({ swaggerData }) => (
  <div style={{ padding: '1rem' }}>
    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Page 2</h2>
    <input
      placeholder="Service Name"
      defaultValue={swaggerData?.serviceName || ''}
      style={{ border: '1px solid #ccc', padding: '0.5rem', width: '100%', margin: '0.5rem 0' }}
    />
    <input
      placeholder="Endpoint"
      defaultValue={swaggerData?.endpoint || ''}
      style={{ border: '1px solid #ccc', padding: '0.5rem', width: '100%', margin: '0.5rem 0' }}
    />
    <select
      defaultValue={swaggerData?.method || 'GET'}
      style={{ border: '1px solid #ccc', padding: '0.5rem', width: '100%', margin: '0.5rem 0' }}
    >
      <option>GET</option>
      <option>POST</option>
      <option>PUT</option>
      <option>DELETE</option>
    </select>
  </div>
);

const Page3 = () => (
  <div style={{ padding: '1rem' }}>
    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Page 3</h2>
    <textarea
      placeholder="Final Comments"
      style={{ border: '1px solid #ccc', padding: '0.5rem', width: '100%', height: '8rem', margin: '0.5rem 0' }}
    />
    <input
      placeholder="Signature"
      style={{ border: '1px solid #ccc', padding: '0.5rem', width: '100%', margin: '0.5rem 0' }}
    />
  </div>
);

const Footer = ({ step, onBack, onNext }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', padding: '1rem' }}>
    <button onClick={onBack} disabled={step === 0} style={{ padding: '0.5rem 1rem' }}>
      Back
    </button>
    <button onClick={onNext} style={{ padding: '0.5rem 1rem' }}>
      {step === 2 ? 'Submit' : 'Next'}
    </button>
  </div>
);

export default function App() {
  const [step, setStep] = useState(0);
  const [swaggerData, setSwaggerData] = useState(null);

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const importFromSwagger = () => {
    // Simulate data import and move to page 2
    setSwaggerData({
      serviceName: 'Demo Service',
      endpoint: '/demo',
      method: 'GET',
    });
    setStep(1);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white', color: 'black' }}>
      <StepperHeader />
      <Stepper step={step} />
      {step === 0 && <Page1 onImport={importFromSwagger} />}
      {step === 1 && <Page2 swaggerData={swaggerData} />}
      {step === 2 && <Page3 />}
      <Footer step={step} onBack={handleBack} onNext={handleNext} />
      <div style={{ textAlign: 'center', fontSize: '0.875rem', padding: '0.5rem' }}>Copyright text</div>
    </div>
  );
}
