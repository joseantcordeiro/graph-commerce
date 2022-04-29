LOAD CSV WITH HEADERS FROM 'file:///language-codes-3b2_csv.csv' AS row
MERGE (c:Languague {alpha_2: row.alpha2, name: row.English})
RETURN *