import React from "react";
import axios from "axios";
import { API_BASE_URL } from './config';
import { 
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  IconButton,
  Fade,
  SelectChangeEvent,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  AddCircleOutline, 
  CloudUpload, 
  Psychology,
  ArrowForward
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      <Fade in={value === index}>
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      </Fade>
    </div>
  );
}

export default function Dashboard() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [tabValue, setTabValue] = React.useState(0);
    const [merchant, setMerchant] = React.useState("");
    const [amountCents, setAmountCents] = React.useState(0);
    const [date, setDate] = React.useState("");
    const [category, setCategory] = React.useState<string>("");
    const [csvFile, setCsvFile] = React.useState<File | null>(null);
    const [question, setQuestion] = React.useState("");
    const [analysisResult, setAnalysisResult] = React.useState<any>(null);
    const [waiting_analysis, setWaitingAnalysis] = React.useState(false);

    const handleCategoryChange = (event: SelectChangeEvent) => {
      setCategory(event.target.value);
    };

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

    async function handleAnalyzeQuestion() {
        setWaitingAnalysis(true);
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
        setWaitingAnalysis(false);
        setAnalysisResult(response.data);
        } catch (error) {
        console.error("Error during analysis:", error);
        alert("Failed to analyze. Please try again.");
        }
    }



    // Main render

    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #fbfbfd 0%, #fff 100%)',
          position: 'relative',
          overflow: 'hidden',
          py: 4
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                color: '#1d1d1f',
                fontSize: { xs: '28px', sm: '36px' },
                mb: 4
              }}
            >
              Personal Finance Dashboard
            </Typography>
          </motion.div>

          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={(_, newValue) => setTabValue(newValue)}
              centered
              variant={isMobile ? "fullWidth" : "standard"}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minWidth: isMobile ? 'auto' : 160,
                  fontSize: '1rem',
                  textTransform: 'none',
                  fontWeight: 500,
                  py: 2
                }
              }}
            >
              <Tab 
                icon={<AddCircleOutline />} 
                label="Add Transaction" 
                iconPosition="start"
              />
              <Tab 
                icon={<CloudUpload />} 
                label="Import CSV" 
                iconPosition="start"
              />
              <Tab 
                icon={<Psychology />} 
                label="AI Analysis" 
                iconPosition="start"
              />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Box component="form" onSubmit={handleAddTransaction} sx={{ maxWidth: 600, mx: 'auto' }}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Merchant"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Amount (dollars)"
                    value={(amountCents / 100).toFixed(2)}
                    onChange={(e) => setAmountCents(Math.round(parseFloat(e.target.value) * 100))}
                    required
                    inputProps={{ step: "0.01" }}
                  />
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={category}
                      onChange={handleCategoryChange}
                      label="Category"
                    >
                      <MenuItem value="food">Food</MenuItem>
                      <MenuItem value="transport">Transport</MenuItem>
                      <MenuItem value="entertainment">Entertainment</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ 
                      height: 48,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontSize: '1rem'
                    }}
                  >
                    Add Transaction
                  </Button>
                </Stack>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                  id="csv-file-input"
                />
                <label htmlFor="csv-file-input">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    sx={{ 
                      mb: 3,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontSize: '1rem',
                      height: 48
                    }}
                  >
                    Select CSV File
                  </Button>
                </label>
                {csvFile && (
                  <Typography sx={{ mb: 2 }}>
                    Selected file: {csvFile.name}
                  </Typography>
                )}
                <Button
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
                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                      }
                    } catch (error) {
                      console.error("Error importing CSV:", error);
                      alert("Failed to import CSV file. Please check the file format and try again.");
                    }
                  }}
                  variant="contained"
                  disabled={!csvFile}
                  startIcon={<CloudUpload />}
                  sx={{ 
                    height: 48,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1rem'
                  }}
                >
                  Upload CSV
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <Card 
                  elevation={0}
                  sx={{ 
                    mb: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="E.g., What's my total spending in the last month?"
                        variant="outlined"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            height: 48
                          }
                        }}
                      />
                      <Button
                        onClick={handleAnalyzeQuestion}
                        variant="contained"
                        sx={{ 
                          height: 48,
                          borderRadius: 3,
                          textTransform: 'none',
                          fontSize: '1rem',
                          px: 3
                        }}
                      >
                        Analyze
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                {analysisResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card 
                      elevation={0}
                      sx={{ 
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          Analysis Result
                        </Typography>
                        <Typography sx={{ whiteSpace: 'pre-line' }}>
                          {analysisResult.summary}
                        </Typography>
                        {waiting_analysis ? <Typography sx={{ whiteSpace: 'pre-line' }}>
                          Loading detailed analysis...
                        </Typography> : null}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </Box>
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    );
}