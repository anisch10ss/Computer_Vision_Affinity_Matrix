import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from itertools import combinations
import numpy as np
import ast

app = Flask(__name__)
CORS(app)

# Load your dataset
data = pd.read_csv('data_complete.csv')

# Create a dictionary to associate each LIB with FK_ARTICLE
lib_to_fk_article = {}

# Iterate over each row in the dataframe
for index, row in data.iterrows():
    # Extract LIB_LIST and FK_ARTICLE values from the current row
    libs = row['LIB_LIST']
    fk_article = row['FK_ARTICLE']
    
    # Convert libs to a list if it's a string representation of a list
    if isinstance(libs, str):
        try:
            libs = ast.literal_eval(libs)  
            fk_article=ast.literal_eval(fk_article)  
        except ValueError:
            # Handle the case where 'LIB_LIST' is not a valid string representation of a list
            # You can log a warning or handle this case as needed
            continue
    
        # Ensure libs is a list
        if isinstance(libs, list):
            # Iterate over each LIB in the list
            for lib, fk in zip(libs, fk_article):
                # Clean up the LIB value
                lib = lib.strip().replace('"', '').strip("][").strip("'")
                # Associate each LIB individually with its FK_ARTICLE
                if lib not in lib_to_fk_article:
                    lib_to_fk_article[lib] = []
                # Associate FK_ARTICLE with the current LIB
                lib_to_fk_article[lib].append(fk)
                    
# Endpoint to fetch the list of products
@app.route('/api/products')
def get_products():
    # Split each entry in LIB_LIST by comma and explode to get individual products
    all_products = data['LIB_LIST'].str.split(',').explode()
    
    # Strip whitespace from each product and remove empty strings
    all_products = all_products.str.strip().replace('', np.nan).dropna()
    
    # Remove extra quotes from each product
    all_products = all_products.str.replace(r'"', '')
    all_products = all_products.str.replace(r'"', '')
    all_products = all_products.str.strip('][')
    all_products = all_products.str.strip("'")
    # Get unique products
    unique_products = all_products.unique().tolist()
    
    return jsonify({'products': unique_products})


# Endpoint to calculate percentages based on selected items
@app.route('/api/calculate-percentages', methods=['POST'])
def calculate_percentages():
    # Get the request data
    request_data = request.json
    
    # Extract selected items from request data
    selected_items = request_data['selected_items']
    
    # Ensure the number of selected items is between 2 and 10
    if len(selected_items) < 2 or len(selected_items) > 10:
        return jsonify({"error": "Number of selected items must be between 2 and 10."}), 400
    
    # Initialize percentages dictionary
    percentages = {}
    
    # Iterate over all combinations of selected items
    for item1, item2 in combinations(selected_items, 2):
        # Initialize counts for current combination
        total_tickets = 0
        has_item_counts_a = {item: 0 for item in selected_items}
        has_item_counts = {item: 0 for item in selected_items}           
        for ticket_items in data['FK_ARTICLE']:
            ticket_items_list = [item.strip() for item in ticket_items.strip('][').strip("'").split(',')] 
            for item in selected_items:
                fk_article = lib_to_fk_article[item][0]
                if str(fk_article) in ticket_items_list:
                    has_item_counts[item] += 1
            fk_article_1 = lib_to_fk_article[item1][0]
            fk_article_2 = lib_to_fk_article[item2][0]
            if str(fk_article_1) in ticket_items_list and str(fk_article_2) in ticket_items_list:
                has_item_counts_a[item1] += 1
            total_tickets += 1  
        print(has_item_counts_a)
        print(has_item_counts)
        print('total_tickets',total_tickets)
        key = ', '.join(selected_items) 
        if item1 != item2:
            percentage_b_from_a = (has_item_counts_a[item1] / has_item_counts[item1]) * 100
            percentage_a_from_b = (has_item_counts_a[item1] / has_item_counts[item2]) * 100
            key = f"{item1} / {item2}"
            percentages[key] = {
                'percentage_b_from_a': percentage_b_from_a,
                'percentage_a_from_b': percentage_a_from_b
            }

    print(percentages)
    return jsonify(percentages)

if __name__ == '__main__':
    app.run(debug=True)
