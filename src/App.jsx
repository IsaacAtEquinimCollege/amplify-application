import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { generateClient } from "aws-amplify/data";

Amplify.configure({
  ...outputs,
  Auth: {
    Cognito: { allowGuestAccess: true },
  },
});

const client = generateClient();

function App() {
  const [counters, setCounters] = useState([])

  useEffect(() => {
    async function getCounters() {
      const response = await client.models.Counter.list({ authMode: "identityPool" });
      setCounters(response.data);
    }

    getCounters();
  }, []);

  async function createCounter() {
    const response = await client.models.Counter.create(
      { value: 0 },
      { authMode: "identityPool" },
    );

    setCounters((oldCounters) => [...oldCounters, {
      id: response.data.id,
      value: 0,
    }]);
  }

  function updateCounter(id, newValue) {
    client.models.Counter.update(
      {
        id,
        value: newValue,
      },
      { authMode: "identityPool" },
    );

    setCounters((oldCounters) => {
      const newCounters = [...oldCounters];

      const counterToUpdate = newCounters.find((counter) => {
        return counter.id === id;
      });

      counterToUpdate.value++;
      return newCounters;
    });
  }

  function deleteCounter(id) {
    client.models.Counter.delete(
      { id },
      { authMode: "identityPool" },
    );

    setCounters((oldCounters) => {
      const newCounters = oldCounters.filter((counter) => {
        return counter.id !== id;
      });

      return newCounters;
    });
  }

  const countersContent = counters.map((counter) => {
    return <div key={counter.id}>
      <button onClick={() => updateCounter(counter.id, counter.value + 1)}>
        count is {counter.value}
      </button>

      <button onClick={() => deleteCounter(counter.id)}>-</button>
    </div>;
  });

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Amplify Application</h1>
      <div className="card">{countersContent}</div>

      <div className="card">
        <button onClick={createCounter}>+</button>
      </div>
    </>
  )
}

export default App
