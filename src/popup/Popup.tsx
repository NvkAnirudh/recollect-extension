import React, { useState, useEffect } from 'react';

type SaveStatus = 'idle' | 'loading' | 'success' | 'error';

const Popup: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [message, setMessage] = useState('');
  const [platform, setPlatform] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0]?.url || '';
      setUrl(currentUrl);

      // Detect platform
      if (currentUrl.includes('instagram.com')) setPlatform('Instagram');
      else if (currentUrl.includes('youtube.com')) setPlatform('YouTube');
      else if (currentUrl.includes('tiktok.com')) setPlatform('TikTok');
      else if (currentUrl.includes('linkedin.com')) setPlatform('LinkedIn');
    });

    // Check authentication status
    const checkAuth = () => {
      chrome.storage.local.get('token', (result) => {
        setIsAuthenticated(!!result.token);
      });
    };

    checkAuth();

    // Listen for storage changes to update UI immediately
    const storageListener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.token) {
        setIsAuthenticated(!!changes.token.newValue);
      }
    };

    chrome.storage.onChanged.addListener(storageListener);

    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  const handleSave = async () => {
    if (!url.trim()) {
      setStatus('error');
      setMessage('No URL detected');
      return;
    }

    setStatus('loading');
    setMessage('Saving...');

    try {
      const { token } = await chrome.storage.local.get('token');

      // Check if user is authenticated
      if (!token) {
        setStatus('error');
        setMessage('Please sign in to save content');
        return;
      }

      const response = await fetch(`https://video-ingest.up.railway.app/api/contents/submit?url=${encodeURIComponent(url)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Saved! Processing in 2-3 minutes');

        // Close popup after 2 seconds
        setTimeout(() => window.close(), 2000);
      } else if (response.status === 401) {
        // Authentication error - clear invalid token and prompt sign in
        await chrome.storage.local.remove('token');
        setStatus('error');
        setMessage('Please sign in to save content');
      } else {
        setStatus('error');
        setMessage(data.detail || 'Failed to save');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const handleSignIn = () => {
    chrome.tabs.create({ url: 'https://recollectai.app/recordar/signin' });
  };

  const handleSignOut = async () => {
    await chrome.storage.local.clear();
    setIsAuthenticated(false);
    setStatus('idle');
    setMessage('');
  };

  return (
    <div className="popup-container">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <img src={chrome.runtime.getURL('public/icons/icon48.png')} alt="Recollect" className="logo" />
          <div>
            <h1 className="title">Recollect</h1>
            <p className="subtitle">Save to your library</p>
          </div>
        </div>
        {isAuthenticated && (
          <button onClick={handleSignOut} className="sign-out-btn-header">
            Sign out
          </button>
        )}
      </div>

      {/* Content */}
      <div className="content">
        {status === 'success' ? (
          <div className="status-message success">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2>{message}</h2>
            <p className="text-sm">You can close this window</p>
          </div>
        ) : status === 'error' ? (
          <div className="status-message error">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h2>Error</h2>
            <p className="text-sm">{message}</p>
            {message.includes('sign in') ? (
              <button onClick={handleSignIn} className="btn-primary">
                Sign In
              </button>
            ) : (
              <button onClick={() => setStatus('idle')} className="btn-secondary">
                Try Again
              </button>
            )}
          </div>
        ) : (
          <>
            {platform && (
              <div className="platform-badge">
                <span className="badge">{platform}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="url">URL</label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://instagram.com/reel/..."
                disabled={status === 'loading'}
                className="input"
              />
            </div>

            <div className="supported-platforms">
              <p className="text-xs">Supported: Instagram, YouTube, TikTok, LinkedIn</p>
            </div>

            <button
              onClick={handleSave}
              disabled={status === 'loading'}
              className="btn-primary"
            >
              {status === 'loading' ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                'Save to Library'
              )}
            </button>

            <div className="footer-note">
              {isAuthenticated ? (
                <div className="signed-in-status">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Signed in</span>
                </div>
              ) : (
                <p className="text-xs">
                  Not logged in? <a href="https://recollectai.app/recordar/signin" target="_blank">Sign in</a>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Popup;
