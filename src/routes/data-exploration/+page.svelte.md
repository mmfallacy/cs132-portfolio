---
title: 'Data Exploration'
created: 2023-05-16
updated: 2023-05-16
published: 2023-05-16 
---

## Preprocessing

### Handling Missing/Null Data

Some of the rows for the engagement metrics (Likes, Replies, Retweets, and Quote Tweets) were null. To handle this we safely set those values to 0. There were other columns which had null values such as **Location** and **Account Bio**, however we are not going to be using that data hence we just dropped it in the dataframe.

### Outliers

During the data collection phase, it was made sure that there were no outliers that were going to be present.

### Making Sure Tweets Were Consistent

We made the tweets into lowercase, removed hashtags, replaced emojis into interpretation using `demoji`, removed non-alphanumeric characters. We then translate all tweets to English and then removed english stopwords afterwards. Lastly, **Stemming** and **lemmatization** were performed.

## Visualization
