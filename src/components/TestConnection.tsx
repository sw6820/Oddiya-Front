'use client';

import { useState } from 'react';
import { API_CONFIG } from '@/config/api';

export default function TestConnection() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setStatus('Testing connection...');
    
    try {
      // Test health endpoint
      const healthUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`;
      console.log('Testing URL:', healthUrl);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(`✅ Backend connected! Status: ${data.status || 'UP'}`);
        console.log('Health check response:', data);
      } else {
        setStatus(`❌ Backend error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      setStatus(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testPlacesAPI = async () => {
    setLoading(true);
    setStatus('Testing places API...');
    
    try {
      const placesUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.places}`;
      console.log('Testing Places URL:', placesUrl);
      
      const response = await fetch(placesUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(`✅ Places API connected! Found ${data.length || 0} places`);
        console.log('Places response:', data);
      } else {
        setStatus(`❌ Places API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Places API error:', error);
      setStatus(`❌ Places API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Backend Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Backend URL: {API_CONFIG.baseUrl}
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={testBackendConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Health Endpoint
          </button>
          
          <button
            onClick={testPlacesAPI}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test Places API
          </button>
        </div>
        
        {status && (
          <div className={`p-4 rounded ${
            status.includes('✅') ? 'bg-green-100' : 
            status.includes('❌') ? 'bg-red-100' : 
            'bg-yellow-100'
          }`}>
            <pre className="whitespace-pre-wrap text-sm">{status}</pre>
          </div>
        )}
      </div>
    </div>
  );
}