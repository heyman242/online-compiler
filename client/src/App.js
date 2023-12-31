import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import stubs from './defaultStubs';
import moment from "moment";

import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';


function App() {
  // State variables for code and output
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState(null);
  const [jobId, setJobId]= useState(null);
  const [jobDetails, setJobDetails] = useState(null);


  useEffect(() =>{
    setCode(stubs[language]);

  } , [language]);

  useEffect(() => {
    const defaultLang = localStorage.getItem("default-language") || "cpp";
    setLanguage(defaultLang);
  }, []);

  const setDefaultLanguage = () => {
    localStorage.setItem("default-language", language);
    console.log(`${language} set default language.`)
  };

  const renderTimeDetails = () => {
    if(!jobDetails){
      return "";
    }
    let { submittedAt, startedAt, completedAt } = jobDetails;
    let result = '';
    submittedAt = moment(submittedAt).toString();
    result += `Job Submitted At: ${submittedAt}  `;
    if (!startedAt || !completedAt) return result;
    const start = moment(startedAt);
    const end = moment(completedAt);
    const diff = end.diff(start, "seconds", true);
    result += `Execution Time: ${diff}s`;

    return result;
  
  }

  let pollInterval;


  const handleSubmit = async () => {
    const payload = {
      language,
      code,
    };
    try {
      setOutput("");
      setStatus(null);
      setJobId(null);
      setJobDetails(null);
      const { data } = await axios.post("http://localhost:5000/run", payload);
      if (data.jobId) {
        setJobId(data.jobId);
        setStatus("Submitted.");

        // poll here
        pollInterval = setInterval(async () => {
          const { data: statusRes } = await axios.get(
            `http://localhost:5000/status`,
            {
              params: {
                id: data.jobId,
              },
            }
          );
          const { success, job, error } = statusRes;
          console.log(statusRes);
          if (success) {
            const { status: jobStatus, output: jobOutput } = job;
            setStatus(jobStatus);
            setJobDetails(job);
            if (jobStatus === "pending") return;
            setOutput(jobOutput);
            clearInterval(pollInterval);
          } else {
            console.error(error);
            setOutput(error);
            setStatus("Bad request");
            clearInterval(pollInterval);
          }
        }, 1000);
      } else {
        setOutput("Retry again.");
      }
    } catch ({ response }) {
      if (response) {
        const errMsg = response.data.err.stderr;
        setOutput(errMsg);
      } else {
        setOutput("Please retry submitting.");
      }
    }
  };

  // Render the component
  return (
    <div className="App" id="app-container">
      <h1>Online Code Compiler</h1>
      <div>
        <label>Language:</label>
        <select
          value={language}
          onChange={(e) => {
            const shouldSwitch = window.confirm(
              "Are you sure you want to change language? WARNING: Your current code will be lost."
            );
            if (shouldSwitch) {
              setLanguage(e.target.value);
            }
          }}
        >
          <option value="cpp">C++</option>
          <option value="py">Python</option>
        </select>
      </div>
      <br />
      <div>
        <button onClick={setDefaultLanguage}>Set Default</button>
      </div>
      <br />
      <AceEditor
  mode={language === 'cpp' ? 'c_cpp' : 'python'}
  theme="monokai"
  value={code}
  onChange={setCode}
  fontSize={14}
  showPrintMargin={true}
  showGutter={true}
  highlightActiveLine={true}
  style={{ margin: '0 auto', width: '50%', height: '400px' }}
/>


      <br />
      <button onClick={handleSubmit}>Submit</button>
      <p>{status}</p>
      <p>{jobId ? `Job ID: ${jobId}` : ""}</p>
      <p>{renderTimeDetails()}</p>
      <p>{output}</p>
    </div>
  );
}

export default App;
