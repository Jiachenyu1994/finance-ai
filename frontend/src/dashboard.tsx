import React from "react";
import axios from "axios";
import { API_BASE_URL } from './config';

export default function Dashboard() {
    const [functionPage, setFunctionPage] = React.useState("main");
    const [merchant, setMerchant] = React.useState("");
    const [amountCents, setAmountCents] = React.useState(0);
    const [date, setDate] = React.useState("");
    const [category, setCategory] = React.useState("");
    const [csvFile, setCsvFile] = React.useState<File | null>(null);
    const [question, setQuestion] = React.useState("");
    const [analysisResult, setAnalysisResult] = React.useState<any>(null);

    async function handleAddTransaction(e: React.FormEvent) {
        e.preventDefault();
        const token = localStorage.getItem("authToken");
        const data = {
                    date,
                    merchant,
                    amount_cents: amountCents,
                    category,
                }
        try{
            const response = await axios.post(`${API_BASE_URL}/api/add_transaction`, 
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (response.data.status === 'success') {
                alert("Transaction added successfully!");
                // Reset form fields
                setDate("");
                setMerchant("");
                setAmountCents(0);
                setCategory("");
            }
        } catch (error) {
            console.error("Error adding transaction:", error);
            alert("Failed to add transaction.");
        }
    }

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
        
        <h1>欢迎来到 Dashboard 页面！</h1>
        <p>这里是你的个人数据分析中心。</p>
            <div style={{
                    display: "flex",            // 横向布局
                    justifyContent: "center",   // 居中
                    gap: "30px",                // 每个项之间的间距
                    fontSize: "18px",           // 可选，美观一点
                    cursor: "pointer"           // 鼠标悬停效果
                }}>
                <div onClick={() => setFunctionPage("addItems")}>Add items</div>
                <div onClick={() => setFunctionPage("importCsv")}>Import csv files</div>
                <div onClick={() => setFunctionPage("aiAnalysis")}>Ai analysis</div>
            </div>
            <div>
                {functionPage === "addItems" && 
                <div>
                    <h2>Add Items</h2>
                    <p>Please feel free to add any items you want.</p>
                    <form onSubmit={handleAddTransaction} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginTop: "20px" }}    >
                        <label>Date:</label>
                        <input type="date" placeholder="YYYY-MM-DD" value={date} onChange={(e) => setDate(e.target.value)} required />
                        <label >Merchant:</label>
                        <input type="text" placeholder="Merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} required />
                        <label>Amount(dollars):</label>
                        <input type="number" step="0.01" placeholder="0" value={(amountCents / 100).toFixed(2)} onChange={(e) => setAmountCents(Math.round(parseFloat(e.target.value) * 100))} required />
                        <label>Category:</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                            <option value="">Select Category</option>
                            <option value="food">Food</option>
                            <option value="transport">Transport</option>
                            <option value="entertainment">Entertainment</option>
                        </select>
                        <button type="submit">Add Item</button>
                    </form>
                </div>}
            </div>
                {functionPage === "importCsv" && 
                <div style={{ marginTop: "20px" }}>
                    <h2>Import CSV File</h2>
                    <p>Upload a CSV file with columns: date, merchant, amount_cents, category</p>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                            style={{ margin: "20px 0" }}
                        />
                        <button
                            onClick={async () => {
                                if (!csvFile) {
                                    alert("Please select a file first!");
                                    return;
                                }
                                const token = localStorage.getItem("authToken");
                                const formData = new FormData();
                                formData.append("file", csvFile);
                                
                                try {
                                    const response = await axios.post(
                                        `${API_BASE_URL}/api/load_csv`,
                                        formData,
                                        {
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                                "Content-Type": "multipart/form-data"
                                            }
                                        }
                                    );
                                    
                                    if (response.data.status === "success") {
                                        alert(`Successfully imported ${response.data.rows_inserted} transactions!`);
                                        setCsvFile(null);
                                        // 清空input file
                                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                        if (fileInput) fileInput.value = "";
                                    }
                                } catch (error) {
                                    console.error("Error importing CSV:", error);
                                    alert("Failed to import CSV file. Please check the file format and try again.");
                                }
                            }}
                            disabled={!csvFile}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: csvFile ? "#4CAF50" : "#cccccc",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: csvFile ? "pointer" : "not-allowed"
                            }}
                        >
                            Upload CSV
                        </button>
                    </div>
                </div>}
                
                {functionPage === "aiAnalysis" && 
                <div style={{ marginTop: "20px", maxWidth: "800px", margin: "20px auto" }}>
                    <h2>AI Analysis</h2>
                    <p>Ask questions about your transactions using natural language</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="E.g., What's my total spending in the last month?"
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    fontSize: "16px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc"
                                }}
                            />
                            <button
                                onClick={async () => {
                                    if (!question.trim()) {
                                        alert("Please enter a question!");
                                        return;
                                    }
                                    const token = localStorage.getItem("authToken");
                                    try {
                                        const response = await axios.post(
                                            `${API_BASE_URL}/api/analyze/query`,
                                            { question },
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${token}`
                                                }
                                            }
                                        );
                                        setAnalysisResult(response.data);
                                    } catch (error) {
                                        console.error("Error during analysis:", error);
                                        alert("Failed to analyze. Please try again.");
                                    }
                                }}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Analyze
                            </button>
                        </div>
                        
                        {analysisResult && (
                            <div style={{ 
                                marginTop: "20px", 
                                padding: "20px", 
                                border: "1px solid #ccc", 
                                borderRadius: "4px",
                                backgroundColor: "#f9f9f9"
                            }}>
                                <h3 style={{ marginTop: 0 }}>Analysis Result</h3>
                                <div style={{ marginBottom: "15px" }}>
                                    <strong>Summary:</strong>
                                    <p>{analysisResult.summary}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>}
            </div>
        
    );
}