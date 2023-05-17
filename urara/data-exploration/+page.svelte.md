---
title: 'Data Exploration'
created: 2023-05-16
updated: 2023-05-16
published: 2023-05-16
---

<script>

    import Scatter from '$lib/components/extra/scatter.svelte'

</script>

## Overview

### Handling Missing/Null Data

Some of the rows for the engagement metrics (Likes, Replies, Retweets, and Quote Tweets) were null. To handle this we safely set those values to 0. There were other columns which had null values such as **Location** and **Account Bio**, however we are not going to be using that data hence we just dropped it in the dataframe.

### Outliers

During the data collection phase, it was made sure that there were no outliers that were going to be present.

### Making Sure Tweets Were Consistent

We made the tweets into lowercase, removed hashtags, replaced emojis into interpretation using `demoji`, removed non-alphanumeric characters. We then translate all tweets to English and then removed english stopwords afterwards. Lastly, **Stemming** and **lemmatization** were performed.

## Visualization

## Data Exploration Steps

### Preliminaries

Install `demoji`, `polars`, `nltk` through

```py
pip install demoji polars nltk
```

Install `nltk.corpus.stopwords` for English stopword filtering through

```py
import nltk
nltk.download('stopwords')
```

Install `nltk.stem.wordnet` for Stemming and Lemmatization through

```py
import nltk
nltk.download('wordnet')
```

### Preprocessing

#### Cleaning ID values.

As the ID values for the dataset is in the form of `00-nn`, we need to transform it such that we obtain an integer value `nn`.

```py
# Clean ID Part
df = df.select([
    pl.col("ID").apply(lambda id: id.split("-")[1]).cast(pl.Int32),
    pl.exclude("ID")
])
```

#### Dropping rows without Tweets or Tweet URL

Since we deem that the columns `Tweet` and `Tweet URL` as the most important features, we drop all rows without these features.

```py
# Remove rows without tweet AND tweet URL
df = df.filter(pl.col("Tweet").is_not_null() & pl.col("Tweet URL").is_not_null())
```

#### Dropping unused features

Since, the following columns: Location, Account bio, Group, Collector, Category, Screenshot, Rating, Reasoning, Remarks, Reviewer, Views, and Review are not needed, we will be removing them.

```py
# Drop multiple columns\n
df = df.drop(['Location', 'Account bio', 'Group','Collector', 'Category','Keywords','Rating','Reasoning', 'Remarks','Reviewer','Review', 'Screenshot', 'Views'])
```

#### Impute missing values

We will now be checking how big our dataset is. We do this by checking df.shape This revealed that we have 153 unique rows to work with. However, we have some entries that have a null value. To handle this we need to check whether we can replace the null value with a value otherwise we need to fill that up. In the Content type column which is categoric column, we cannot simply do this. Hence, I will be reviewing the dataset and input the values manually and importing it again. On the other hand, engagement metrics that are null we can safely set to 0.

```py
df = df.fill_null(0)
```

#### Clean the tweet data

##### Turn the text into lowercase

```py
# Change tweet case to lowercase
df = df.select(
    pl.all(),
    pl.col("Translated").apply(lambda tweet: tweet.lower()).alias("Clean")
)
```

##### Remove hashtags

```py
# Remove hashtags
HASH_RE = r"#(\w+)"
df = df.select(
    pl.exclude("Clean"),
    pl.col("Clean").apply(lambda tweet: re.sub(HASH_RE, '', tweet))
)
```

##### Remove URL

```py
# Remove URLs
URL_RE = r'(https?://[^\s]+)'

df = df.select(
    pl.exclude("Clean"),
    pl.col("Clean").apply(lambda tweet: re.sub(URL_RE,'', tweet))
)
```

##### Turn emojis into words

```py
# Replace all emojis into interpretation
def emoji_to_word(tweet):
  for symbol, interpretation in demoji.findall(tweet).items():
    interpretation = interpretation.lower()
    # Turn flag: Philippines into flagphilippines
    interpretation = re.sub('[^0-9a-z]+', '', interpretation)
    # replace all emojis to "emojiinterpretation "
    tweet = re.sub(symbol, interpretation+' ', tweet)
  return tweet

df = df.select(
    pl.exclude("Clean"),
    pl.col("Clean").apply(emoji_to_word)
)
```

##### Remove non-alphanumeric characters

```py
# Remove non alphanumeric characters
df = df.select(
    pl.exclude("Clean"),
    pl.col("Clean").apply(lambda tweet: re.sub('[^0-9a-z]+', ' ', tweet))
)
```

##### Cast tweets into array of string tokens

```py
# Cast Tweets to word array instead of long string.
df = df.select(
    pl.all(),
    pl.col("Clean").apply(lambda tweet: tweet.split()).cast(pl.List(str)).alias("Tokenized")
)
```

##### Filter english stopwords

```py
# Strip english stopwords
ensw = stopwords.words('english')
df = df.select(
    pl.all(),
    pl.col("Tokenized").arr.eval(pl.element().filter(~pl.element().is_in(ensw)), parallel=True).alias("Stopwords Removed")
)
```

##### Stem and Lemmatize

```py
# Stem and Lemmatize.
from nltk.stem import PorterStemmer, WordNetLemmatizer

# Initialize the stemmer and lemmatizer
stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()

df = df.select(
    pl.all(),
    pl.col("Stopwords Removed").apply(lambda words: [stemmer.stem(word) for word in words.to_list()]).alias("Stemmed"),
    pl.col("Stopwords Removed").apply(lambda words: [lemmatizer.lemmatize(word) for word in words.to_list()]).alias("Lemmatized")
)
```

### Visualization

#### Scatterplots

Let's now explore some relations between the data using scatterplots! We will plot the number of Followers against the number of Followings to see what kind of accounts usually tweet disinformation about this particular topic. Here we can see there is a huge cluster of accounts that have relatively high following vs their amount of followers.

<Scatter />

```py
df1=df.select(
    pl.col("ID"),
    pl.col("Account handle"),
    pl.col("Following"),
    pl.col("Followers"),
    pl.col("Account type").str.strip(),
)

colors = {
    'Identified': 'blue',
    'Media': 'orange',
    'Anonymous': 'red'
}

import plotly.express as px
import plotly.graph_objects as go

fig = go.Figure()

for account_type, color in colors.items():
    filtered_df = df.filter(pl.col('Account type') == account_type)
    fig.add_trace(go.Scatter(
        x=filtered_df['Following'],
        y=filtered_df['Followers'],
        mode='markers',
        text=filtered_df['Account handle'],
        hovertemplate='<b>%{text}</b><br>Following: %{x}<br>Followers: %{y}',
        marker=dict(
            size=10,
            color=color,
            opacity=0.7,
            line=dict(width=0.5, color='black')
        ),
        name=account_type  # Specify the name for each trace
    ))

# Customize the layout
fig.update_layout(
    title='Following vs Followers',
    xaxis_title='Following',
    yaxis_title='Followers',
    hoverlabel=dict(bgcolor='white', font_size=12),
    plot_bgcolor='white',
    legend_title='Account Type'
)
```

#### Correlation Heatmaps

Let's now explore some correlations between the numerical data using heatmap! Here darker color shows a stronger negative correlation while bright colors shows a stronger positive correlation.

```py
import polars as pl
import matplotlib.pyplot as plt
import seaborn as sns

df2 = df.select(
    pl.col("Followers"),
    pl.col("Likes"),
    pl.col("Replies"),
    pl.col("Retweets"),
    pl.col("Quote Tweets")
)
# Compute the correlation matrix
corr_matrix = df2.to_pandas().corr()

# Visualize the correlation matrix as a heatmap
plt.figure(figsize=(8, 6))
plt.title("Correlation Heatmap")
sns.heatmap(corr_matrix, annot=True, cmap="viridis")
plt.show()
```

### OMG BARPLOT!

Let's now explore how the different numerical data are distributed across groups using bar plots. We only have 3 groups however the media group data only contains 2 data points.

```py
import polars as pl
import seaborn as sns
import matplotlib.pyplot as plt

# Select the relevant columns
df3 = df.select(
    pl.col("Account type").str.strip(),
    pl.col("Likes"),
    pl.col("Replies"),
    pl.col("Retweets"),
    pl.col("Quote Tweets")
)

# Compute the total count of engagement metrics
df_total = df3.groupby("Account type").sum()
df_total

# Reshape the data to create a long-form representation
data_melted = df_total.to_pandas().melt(
    id_vars=["Account type"],
    value_vars=["Likes", "Replies", "Retweets", "Quote Tweets"],
    var_name="Engagement",
    value_name="Total Count"
)

# Create the bar plot
plt.figure(figsize=(10, 6))
sns.barplot(
    data=data_melted,
    x="Engagement",
    y="Total Count",
    hue="Account type"
)
plt.title("Total Count of Engagement Metrics across Account Types")
plt.xlabel("Engagement Metrics")
plt.ylabel("Total Count")
plt.legend(title="Account Type")
plt.show()
```
