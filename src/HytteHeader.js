import React from 'react';

export default function HytteHeader({ headerTekst, headerBilde, headerOpacity, headerMode }) {
    return (
        <div style={{
            backgroundImage: headerBilde ? `url(${headerBilde})` : 'none',
            backgroundSize: headerMode || 'cover',
            backgroundRepeat: headerMode === 'repeat' ? 'repeat' : 'no-repeat',
            backgroundPosition: 'center',
            width: '100%',
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {headerBilde && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${headerBilde})`,
                    backgroundSize: headerMode || 'cover',
                    backgroundRepeat: headerMode === 'repeat' ? 'repeat' : 'no-repeat',
                    backgroundPosition: 'center',
                    opacity: headerOpacity !== undefined ? headerOpacity : 1,
                    zIndex: 0
                }}></div>
            )}
            <h1 style={{ position: 'relative', zIndex: 1, background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                {headerTekst || 'Velkommen til Hytteboka'}
            </h1>
        </div>
    );
}
