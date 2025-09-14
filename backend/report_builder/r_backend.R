# r_backend.R

# Load necessary libraries
library(haven)  # For reading SPSS files
library(dplyr)  # For data manipulation
library(plumber) # For creating the API

# Function to process SPSS data (e.g., filtering and summarizing)
#* @get /process
#* @param spss_path Path to the SPSS file (e.g., "W:/local-ai-dev/tab-banner-plan/backend/report_builder/test/test.sav")
process_spss <- function(spss_path) {
  # Read the SPSS .sav file
  data <- read_sav(spss_path)
  
  # Example data manipulation: Filter data (age > 18) and calculate the mean age
  result <- data %>%
    filter(age > 18) %>%
    summarise(
      avg_age = mean(age, na.rm = TRUE),  # Calculate the average age
      count = n()                         # Count the number of respondents
    )
  
  # Return the result as a list (will be converted to JSON)
  return(result)
}

# Start the Plumber API (no need for a separate file)
pr <- plumb()  # Plumber will automatically expose all functions with annotations

# Run the API on port 8011
pr$run(host = "0.0.0.0", port = 8011)
