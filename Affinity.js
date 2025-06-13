import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Grid, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const useStyles = {
  container: {
    display: 'flex',
    alignItems: 'start',
    backgroundColor: '#F3F5FA',
    padding: '30px 30px',
    boxSizing: 'border-box',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
  content: {
    textAlign: 'center',
    width: '100%',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
  productCell: {
    textAlign: 'center',
    padding: '8px',
    backgroundColor: '#5F6B8F',
    color: '#fff',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
  emptyCell: {
    padding: '8px',
    backgroundColor: '#fff',
  },
  topLeftCell: {
    textAlign: 'center',
    padding: '8px',
    backgroundColor: '#5F6B8F',
    color: '#fff',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    margin: 'auto',
    borderRadius: '12px',
    overflow: 'hidden',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
  thTd: {
    padding: '5px',
    border: '1px solid #fff',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
  title: {
    color: '#08074E',
    marginBottom: '16px',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
  button: {
    backgroundColor: '#08074E',
    color: '#fff',
    borderRadius: '20px',
    padding: '5px 10px',
    fontSize: '12px',
    marginLeft: '10px',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
  nextButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    color: '#08074E',
    fontSize: '14px',
    textTransform: 'none',
    padding: '0',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
  nextIcon: {
    marginLeft: '8px',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
  paper: {
    padding: '16px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0px 3px 6px rgba(0,0,0,0.1)',
  },
  tableContainer: {
    maxWidth: '100%',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
  autocompleteContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16px',
  },
  autocomplete: {
    width: '300px',
  },
  selectedItemsContainer: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  selectedItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '20px',
    backgroundColor: '#f5f5f5',
    width: '300px',
  },
  deleteButton: {
    marginLeft: '8px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    color: '#08074E',
    fontSize: '14px',
    textTransform: 'none',
    padding: '0',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
  backIcon: {
    marginRight: '8px',
  },
  nextButtonContainer: {
    textAlign: 'right',
    marginTop: '20px',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
};

function App() {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [addedItems, setAddedItems] = useState([]);
  const [percentages, setPercentages] = useState({});
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }
    fetchProducts();
  }, []);

  const handleAdd = () => {
    const newItems = selectedItems.filter((item) => !addedItems.includes(item));
    setAddedItems([...addedItems, ...newItems]);
  };

  const handleDelete = (item) => {
    setAddedItems(addedItems.filter((addedItem) => addedItem !== item));
  };

  const handleNext = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/calculate-percentages', { selected_items: addedItems });
      console.log('Response Data:', response.data);
      setPercentages(response.data);
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleBack = () => {
    setShowTable(false);
  };

  const getInverseTextColor = (value) => {
    const percentage = parseFloat(value) || 0;
    const colorValue = Math.round((percentage / 100) * 255);
    return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
  };

  return (
    <div style={useStyles.container}>
      {!showTable ? (
        <div style={useStyles.content}>
          <h1 style={useStyles.title}>Search Products</h1>
          <br />
          <br />
          <div>
            <div style={useStyles.autocompleteContainer}>
              <Autocomplete
                multiple
                id="products"
                options={products}
                value={selectedItems}
                onChange={(event, newValue) => {
                  setSelectedItems(newValue);
                }}
                renderInput={(params) => <TextField {...params} variant="standard" label="Select Products" />}
                style={useStyles.autocomplete}
              />
              <Button variant="contained" style={useStyles.button} onClick={handleAdd}>
                Add
              </Button>
            </div>
          </div>
          <br />
          <br />
          <div style={useStyles.selectedItemsContainer}>
            {addedItems.map((item) => (
              <div key={item} style={useStyles.selectedItem}>
                {item}
                <IconButton
                  aria-label="delete"
                  size="small"
                  style={useStyles.deleteButton}
                  onClick={() => handleDelete(item)}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
          </div>
          <br />
          <hr style={{ width: '100%', margin: '20px 0' }} />
          <br />
          <div style={useStyles.nextButtonContainer}>
            <Button
              variant="text"
              style={useStyles.nextButton}
              onClick={handleNext}
              endIcon={<ArrowForwardIcon style={useStyles.nextIcon} />}
            >
              Next
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Button
            variant="text"
            style={useStyles.backButton}
            onClick={handleBack}
            startIcon={<ArrowBackIcon style={useStyles.backIcon} />}
          >
            Change Product line
          </Button>
          <br />
          <hr style={{ width: '100%', margin: '20px 0' }} />
          <br />
          <div style={{ width: '100%' }}>
            <Grid container spacing={3} justifyContent="right">
              <Grid item xs={12} sm={8}>
                <div style={useStyles.tableContainer}>
                  <table style={{ ...useStyles.table, backgroundColor: 'transparent' }} data-vertable="ver6">
                    <thead>
                      <tr className="row100 head">
                        <th className="column100 column1" data-column="column1" style={{ ...useStyles.topLeftCell, ...useStyles.thTd, fontWeight: 'normal' }}>
                          Product name
                        </th>
                        {addedItems.map((item, index) => (
                          <th
                            key={item}
                            className={`column100 column${index + 2}`}
                            data-column={`column${index + 2}`}
                            style={{ ...useStyles.productCell, ...useStyles.thTd, fontWeight: 'normal' }}
                          >
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {addedItems.map((item, rowIndex) => (
                        <tr key={item} className="row100">
                          <td className="column100 column1" data-column="column1" style={{ ...useStyles.productCell, ...useStyles.thTd }}>
                            {item}
                          </td>
                          {addedItems.map((otherItem, colIndex) => {
                            const key1 = `${item} / ${otherItem}`;
                            const key2 = `${otherItem} / ${item}`;
                            const percentageData = percentages[key1] || percentages[key2];
                            const percentage_b_from_a = percentageData ? percentageData.percentage_b_from_a : 0;
                            const percentage_a_from_b = percentageData ? percentageData.percentage_a_from_b : 0;

                            let displayContent;
                            if (rowIndex === colIndex) {
                              displayContent = null;
                            } else if (rowIndex < colIndex) {
                              displayContent = `${percentage_b_from_a.toFixed(2)}%`;
                            } else {
                              displayContent = `${percentage_a_from_b.toFixed(2)}%`;
                            }

                            return (
                              <td
                                key={otherItem}
                                className={`column100 column${colIndex + 2}`}
                                data-column={`column${colIndex + 2}`}
                                style={{
                                  ...useStyles.productCell,
                                  ...useStyles.thTd,
                                  fontWeight: 'normal',
                                  backgroundColor: rowIndex !== colIndex ? `rgba(8, 7, 78, ${(rowIndex < colIndex ? percentage_b_from_a : percentage_a_from_b) / 100})` : '',
                                  color: rowIndex !== colIndex ? getInverseTextColor(rowIndex < colIndex ? percentage_b_from_a : percentage_a_from_b) : '',
                                }}
                              >
                                {displayContent}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
