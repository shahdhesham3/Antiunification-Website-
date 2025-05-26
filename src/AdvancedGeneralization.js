import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function AdvancedGeneralization() {
  const [expr1, setExpr1] = useState("");
  const [expr2, setExpr2] = useState("");
  const [logicType, setLogicType] = useState("first-order");
  const [plotkinResult, setPlotkinResult] = useState(null);
  const [improvedResult, setImprovedResult] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState("custom");

  const allDatasets = [
    {
      id: "custom",
      name: "Custom Input",
      expr1: "",
      expr2: "",
      type: "all",
    },
    // First-Order Logic Datasets
    {
      id: "fo_arithmetic",
      name: "FO: Identical Expressions ",
      expr1: "P(a, b)",
      expr2: "P(a, b)",
      type: "first-order",
    },
    {
      id: "fo_list_append",
      name: "FO: Partially Matching Expressions",
      expr1: "P(a, b)",
      expr2: "P(a, c)",
      type: "first-order",
    },
    {
      id: "fo_family_relations",
      name: "FO: Completely Different Expressions",
      expr1: "P(a, b)",
      expr2: "Q(c, d)",
      type: "first-order",
    },
    // Second-Order Logic Datasets
    {
      id: "so_simple_schema",
      name: "SO: Simple Predicate with One Variable Difference",
      expr1: "Likes(John, x)",
      expr2: "Likes(John, Mary)",
      type: "second-order",
    },
    {
      id: "so_quantifier_example",
      name: "SO: Universal Quantifier Generalization",
      expr1: "∀x.Likes(x, y)",
      expr2: "∀z.Likes(z, Mary)",
      type: "second-order",
    },
    {
      id: "so_identity_axiom",
      name: "SO: Existential Quantifier",
      expr1: "∃a.Friends(a, John)",
      expr2: "∃b.Friends(b, Mike)",
      type: "second-order",
    },
    {
      id: "so_higher_order_predicate",
      name: "SO: Nested Predicates",
      expr1: "Likes(John, F(x))",
      expr2: "Likes(John, G(Mary))",
      type: "second-order",
    },
    {
      id: "so_function_generalization",
      name: "SO: Completely Different Predicates",
      expr1: "Likes(John, x)",
      expr2: "Hates(Sam, Mary)",
      type: "second-order",
    },
  ];

  const filteredDatasets = allDatasets.filter(
    (dataset) => dataset.type === "all" || dataset.type === logicType
  );

  const prevLogicTypeRef = useRef(logicType);
  const prevSelectedDatasetRef = useRef(selectedDataset); // NEW: Track previous selectedDataset

  useEffect(() => {
    console.log("--- useEffect running ---");
    console.log("Current selectedDataset:", selectedDataset);
    console.log("Current logicType:", logicType);
    console.log("Current expr1:", expr1);
    console.log("Current expr2:", expr2);
    console.log("Previous selectedDataset (ref):", prevSelectedDatasetRef.current); // Log ref value

    const prevLogicType = prevLogicTypeRef.current;
    const prevDataset = prevSelectedDatasetRef.current; // Get previous selectedDataset from ref

    // Update refs for the next render cycle
    prevLogicTypeRef.current = logicType;
    prevSelectedDatasetRef.current = selectedDataset; // Update ref


    const currentDatasetExistsInNewLogicType = filteredDatasets.some(
      (ds) => ds.id === selectedDataset
    );

    // Scenario 1: Logic type changed AND current dataset is no longer valid. Revert to custom.
    if (logicType !== prevLogicType && !currentDatasetExistsInNewLogicType) {
      console.log("  ACTION: Logic type changed AND dataset invalid. Reverting to custom.");
      setSelectedDataset("custom");
      setExpr1("");
      setExpr2("");
    }
    // Scenario 2: A non-custom dataset was chosen, AND it's a *new* selection.
    // This is the key change to prevent overwrites from StrictMode or re-renders.
    else if (selectedDataset !== "custom" && selectedDataset !== prevDataset) {
      const dataset = filteredDatasets.find((d) => d.id === selectedDataset);
      if (dataset) {
        console.log(`  ACTION: NEW non-custom dataset '${selectedDataset}' selected. Setting expr1/expr2.`);
        setExpr1(dataset.expr1);
        setExpr2(dataset.expr2);
      }
    } else {
        console.log("  INFO: No action needed from useEffect (either custom, or same dataset already loaded).");
    }

    console.log("--- useEffect finished ---");
  }, [logicType, filteredDatasets, selectedDataset]); // Removed expr1, expr2 from dependencies here. We only care about explicit selection changes.

  const handleLogicTypeChange = (e) => {
    const newLogicType = e.target.value;
    console.log("handleLogicTypeChange: Setting logicType to", newLogicType);
    setLogicType(newLogicType);
  };

  const handleDatasetChange = (e) => {
    const newSelectedId = e.target.value;
    console.log("handleDatasetChange: Selected dataset changed to", newSelectedId);
    setSelectedDataset(newSelectedId); // This triggers useEffect

    if (newSelectedId === "custom") {
      console.log("  ACTION: Custom input selected. Clearing textareas.");
      setExpr1("");
      setExpr2("");
    }
    // NO 'else' here to set expr1/expr2 for non-custom datasets.
    // The useEffect above will handle setting it when `selectedDataset` actually changes.
    // This separation prevents immediate double-setting due to handleDatasetChange + useEffect.
  };

  const handleSubmit = async () => {
    console.log("handleSubmit: Submitting expressions.");
    setPlotkinResult(null);
    setImprovedResult(null);

    try {
      const plotkinRes = await axios.post("/plotkin-generalize", {
        expression1: expr1,
        expression2: expr2,
        logic_type: logicType,
      });
      console.log("Plotkin Result:", plotkinRes.data);
      setPlotkinResult(plotkinRes.data);
    } catch (error) {
      console.error("Plotkin Error:", error.response?.data || error.message);
      setPlotkinResult(error.response?.data || { error: "An error occurred." });
    }

    try {
      const improvedRes = await axios.post("/improved-generalize", {
        expression1: expr1,
        expression2: expr2,
        logic_type: logicType,
      });
      console.log("Improved Result:", improvedRes.data);
      setImprovedResult(improvedRes.data);
    } catch (error) {
      console.error("Improved Error:", error.response?.data || error.message);
      setImprovedResult(error.response?.data || { error: "An error occurred." });
    }
  };

  console.log("--- Component AdvancedGeneralization re-rendering ---");
  console.log("expr1 at render:", expr1);
  console.log("expr2 at render:", expr2);

  return (
    <div style={{ padding: 20 }}>
      <h1>Advanced Logic Generalization</h1>

      <label>Logic Type:</label>
      <select value={logicType} onChange={handleLogicTypeChange}>
        <option value="first-order">First-order Logic</option>
        <option value="second-order">Second-order Logic</option>
      </select>
      <br /><br />

      <label>Choose Dataset:</label>
      <select value={selectedDataset} onChange={handleDatasetChange}>
        {filteredDatasets.map((dataset) => (
          <option key={dataset.id} value={dataset.id}>
            {dataset.name}
          </option>
        ))}
      </select>
      <br /><br />

      <textarea
        placeholder="Enter Expression 1"
        value={expr1}
        onChange={(e) => {
          console.log("Textarea 1 onChange: new value =", e.target.value);
          setExpr1(e.target.value);
          console.log("Textarea 1 onChange: setExpr1 called with", e.target.value);
        }}
        rows="5"
        cols="50"
      />
      <textarea
        placeholder="Enter Expression 2"
        value={expr2}
        onChange={(e) => {
          console.log("Textarea 2 onChange: new value =", e.target.value);
          setExpr2(e.target.value);
          console.log("Textarea 2 onChange: setExpr2 called with", e.target.value);
        }}
        rows="5"
        cols="50"
      />
      <button onClick={handleSubmit}>Generalize</button>

      <div style={{ display: "flex", marginTop: 20 }}>
        <div style={{ flex: 1, marginRight: "10px" }}>
          <h2>Plotkin's Algorithm</h2>
          <div style={{ padding: "10px", border: "1px solid #ccc" }}>
            {plotkinResult ? (
              plotkinResult.error ? (
                <div style={{ color: "red" }}>
                  <strong>Error:</strong> {plotkinResult.error}
                  {plotkinResult.limitations && (
                    <ul>
                      {plotkinResult.limitations.map((limitation, index) => (
                        <li key={index}>{limitation}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                  {JSON.stringify(plotkinResult, null, 2)}
                </pre>
              )
            ) : (
              "Result from Plotkin's algorithm will appear here."
            )}
          </div>
        </div>

        <div style={{ flex: 1, marginLeft: "10px" }}>
          <h2>Improved Generalization</h2>
          <div style={{ padding: "10px", border: "1px solid #ccc" }}>
            {improvedResult ? (
              improvedResult.error ? (
                <div style={{ color: "red" }}>
                  <strong>Error:</strong> {improvedResult.error}
                </div>
              ) : (
                <div>
                  <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                    {JSON.stringify(improvedResult.generalization, null, 2)}
                  </pre>
                  <p>{improvedResult.message}</p>
                </div>
              )
            ) : (
              "Result from Improved Generalization will appear here."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}