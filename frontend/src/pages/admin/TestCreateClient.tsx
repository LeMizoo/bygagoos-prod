import React, { useState } from "react";
import { adminClientsApi, CreateClientData } from "../../api/adminClients.api";
import toast from "react-hot-toast";
import dev from '../../utils/devLogger';

const TestCreateClient: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const testMinimalData = async () => {
    setLoading(true);
    const testData: CreateClientData = {
      firstName: "Test",
      lastName: "User",
      email: `test${Date.now()}@example.com`,
    };
    
    try {
      dev.log("📤 Test 1 - Données minimales:", testData);
      const client = await adminClientsApi.create(testData);
      dev.log("✅ Succès:", client);
      setResults(prev => [...prev, { type: "success", data: testData, result: client }]);
      toast.success("Test 1 réussi!");
    } catch (error: any) {
      dev.error("❌ Test 1 échoué:", error);
      setResults(prev => [...prev, { type: "error", data: testData, error: error.message }]);
      toast.error(`Test 1: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithIsActive = async () => {
    setLoading(true);
    const testData: CreateClientData = {
      firstName: "Test2",
      lastName: "User2",
      email: `test2${Date.now()}@example.com`,
      isActive: true,
    };
    
    try {
      dev.log("📤 Test 2 - Avec isActive:", testData);
      const client = await adminClientsApi.create(testData);
      dev.log("✅ Succès:", client);
      setResults(prev => [...prev, { type: "success", data: testData, result: client }]);
      toast.success("Test 2 réussi!");
    } catch (error: any) {
      dev.error("❌ Test 2 échoué:", error);
      setResults(prev => [...prev, { type: "error", data: testData, error: error.message }]);
      toast.error(`Test 2: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithPhone = async () => {
    setLoading(true);
    const testData: CreateClientData = {
      firstName: "Test3",
      lastName: "User3",
      email: `test3${Date.now()}@example.com`,
      phone: "0123456789",
    };
    
    try {
      dev.log("📤 Test 3 - Avec téléphone:", testData);
      const client = await adminClientsApi.create(testData);
      dev.log("✅ Succès:", client);
      setResults(prev => [...prev, { type: "success", data: testData, result: client }]);
      toast.success("Test 3 réussi!");
    } catch (error: any) {
      dev.error("❌ Test 3 échoué:", error);
      setResults(prev => [...prev, { type: "error", data: testData, error: error.message }]);
      toast.error(`Test 3: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithAllFields = async () => {
    setLoading(true);
    const testData: CreateClientData = {
      firstName: "Test4",
      lastName: "User4",
      email: `test4${Date.now()}@example.com`,
      phone: "0123456789",
      company: "Test Company",
      address: "123 Test Street",
      city: "Test City",
      postalCode: "12345",
      country: "Test Country",
      notes: "Test notes",
      isActive: true,
    };
    
    try {
      dev.log("📤 Test 4 - Tous les champs:", testData);
      const client = await adminClientsApi.create(testData);
      dev.log("✅ Succès:", client);
      setResults(prev => [...prev, { type: "success", data: testData, result: client }]);
      toast.success("Test 4 réussi!");
    } catch (error: any) {
      dev.error("❌ Test 4 échoué:", error);
      setResults(prev => [...prev, { type: "error", data: testData, error: error.message }]);
      toast.error(`Test 4: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test de création client</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={testMinimalData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Test données minimales
        </button>
        
        <button
          onClick={testWithIsActive}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Test avec isActive
        </button>
        
        <button
          onClick={testWithPhone}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          Test avec téléphone
        </button>
        
        <button
          onClick={testWithAllFields}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          Test tous les champs
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Test en cours...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Résultats des tests</h2>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.type === "success"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <h3 className="font-bold mb-2">
                  Test {index + 1}: {result.type === "success" ? "✅ Réussi" : "❌ Échoué"}
                </h3>
                <p className="text-sm mb-2">
                  <strong>Données envoyées:</strong>
                </p>
                <pre className="text-xs bg-white p-2 rounded overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
                {result.type === "error" && (
                  <>
                    <p className="text-sm mt-2">
                      <strong>Erreur:</strong> {result.error}
                    </p>
                  </>
                )}
                {result.type === "success" && (
                  <>
                    <p className="text-sm mt-2">
                      <strong>Résultat:</strong>
                    </p>
                    <pre className="text-xs bg-white p-2 rounded overflow-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCreateClient;