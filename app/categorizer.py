import re
import pandas as pd
from typing import Tuple

# Each category maps to a list of regex patterns and a base confidence weight.
# More specific patterns get higher confidence.
CATEGORY_RULES: dict[str, list[Tuple[str, float]]] = {
    "Food": [
        (r"\b(restaurant|ristorante|dining)\b", 0.95),
        (r"\b(cafe|coffee|starbucks|costa|dunkin)\b", 0.90),
        (r"\b(mcdonalds|mcdonald's|burger king|kfc|wendy's|chick-fil-a|taco bell|chipotle|subway|dominos|pizza hut|papa john)\b", 0.95),
        (r"\b(uber\s*eats|deliveroo|doordash|grubhub|just\s*eat|postmates)\b", 0.95),
        (r"\b(supermarket|grocery|grocer|whole\s*foods|kroger|trader\s*joe|aldi|lidl|publix|safeway|costco|sam's\s*club)\b", 0.90),
        (r"\b(walmart|target)\b", 0.60),  # Lower confidence — could be shopping
        (r"\b(bistro|grill|deli|bakery|market|food|meal|lunch|dinner|breakfast)\b", 0.80),
    ],
    "Transport": [
        (r"\buber(?!\s*eats)\b", 0.85),
        (r"\b(bolt|lyft|taxi|cab|ride)\b", 0.90),
        (r"\b(fuel|gas\s*station|petrol|diesel|chevron|shell|exxon|mobil|bp|texaco|marathon)\b", 0.95),
        (r"\b(parking|garage|meter|toll|tolls|towing|tow)\b", 0.90),
        (r"\b(train|metro|subway|bus|transit|amtrak|greyhound|station)\b", 0.90),
        (r"\b(airline|flight|delta|united|american air|southwest|jetblue|spirit|frontier)\b", 0.95),
    ],
    "Subscriptions": [
        (r"\b(netflix|hulu|disney\+?|hbo|paramount|peacock|apple\s*tv)\b", 0.95),
        (r"\b(spotify|apple\s*music|tidal|youtube\s*(music|premium)|audible)\b", 0.95),
        (r"\b(amazon\s*prime)\b", 0.95),
        (r"\b(gym|fitness|peloton|planet\s*fitness|crunch|equinox)\b", 0.90),
        (r"\b(member|club|magazine|patreon|subscript|recurring|monthly\s*fee)\b", 0.75),
        (r"\b(dropbox|icloud|google\s*one|onedrive|adobe|creative\s*cloud|canva)\b", 0.90),
    ],
    "Utilities": [
        (r"\b(electric|electricity|power|energy)\b", 0.95),
        (r"\b(water|sewer|sewage|trash|waste|sanitation)\b", 0.95),
        (r"\b(internet|broadband|wifi|comcast|spectrum|centurylink|cox|xfinity)\b", 0.90),
        (r"\b(phone|telecom|mobile|verizon|at&t|t-mobile|sprint|cricket|mint\s*mobile)\b", 0.90),
        (r"\b(utility|utilit|bill|gas\s*bill)\b", 0.80),
    ],
    "Shopping": [
        (r"\b(amazon)(?!\s*prime)\b", 0.70),
        (r"\b(zara|h&m|shein|asos|fashion|clothing|apparel|shoes|sneakers)\b", 0.90),
        (r"\b(store|mall|boutique|outlet)\b", 0.70),
        (r"\b(best\s*buy|apple\s*store|micro\s*center|newegg)\b", 0.90),
        (r"\b(macys|macy's|nordstrom|gap|old\s*navy|banana\s*republic|uniqlo|forever\s*21)\b", 0.90),
        (r"\b(ikea|home\s*depot|lowe's|wayfair|bed\s*bath)\b", 0.85),
        (r"\b(cvs|walgreens|rite\s*aid)\b", 0.70),
        (r"\b(jumia|takealot|ebay|etsy|shopify|wish)\b", 0.80),
    ],
    "Housing": [
        (r"\b(rent|lease|landlord|tenant|apartment|condo|flat)\b", 0.95),
        (r"\b(mortgage|home\s*loan|housing)\b", 0.95),
        (r"\b(hoa|homeowner|property\s*tax|estate\s*agent|realty|realtor)\b", 0.90),
        (r"\b(home\s*insurance|renters?\s*insurance)\b", 0.90),
    ],
    "Health": [
        (r"\b(pharmacy|rx|prescription|cvs\s*pharmacy|walgreens\s*pharmacy)\b", 0.90),
        (r"\b(doctor|physician|dr\.|medical|clinic|hospital|urgent\s*care|er\b)\b", 0.95),
        (r"\b(dental|dentist|orthodont|vision|optometrist|eye\s*care)\b", 0.90),
        (r"\b(therapy|therapist|counseling|mental\s*health|psycholog)\b", 0.90),
        (r"\b(health\s*insurance|copay|deductible)\b", 0.90),
        (r"\b(fitness|wellness|vitamin|supplement)\b", 0.70),
    ],
    "Income": [
        (r"\b(payroll|salary|wages|direct\s*dep|paycheck|compensation)\b", 0.95),
        (r"\b(deposit|transfer\s*from|incoming)\b", 0.75),
        (r"\b(dividend|interest\s*earned|yield|capital\s*gain)\b", 0.90),
        (r"\b(refund|reimbursement|cashback|rebate)\b", 0.85),
        (r"\b(bonus|commission|tip|gratuity)\b", 0.85),
        (r"\b(revenue|freelance|invoice\s*paid|client\s*payment)\b", 0.90),
    ],
    "Entertainment": [
        (r"\b(cinema|movie|theater|theatre|amc|regal|imax)\b", 0.90),
        (r"\b(concert|ticket|ticketmaster|stubhub|eventbrite|live\s*nation)\b", 0.90),
        (r"\b(game|gaming|steam|playstation|xbox|nintendo|twitch)\b", 0.85),
        (r"\b(bar|pub|nightclub|lounge|brewery|taproom|wine|beer|spirits|liquor)\b", 0.85),
    ],
    "Education": [
        (r"\b(tuition|university|college|school|course|class|lecture)\b", 0.90),
        (r"\b(udemy|coursera|skillshare|masterclass|linkedin\s*learning)\b", 0.95),
        (r"\b(textbook|book|kindle|library)\b", 0.70),
        (r"\b(student\s*loan|scholarship|financial\s*aid)\b", 0.90),
    ],
}


def categorize_description(description: str, amount: float) -> Tuple[str, float]:
    """Classifies a transaction using regex patterns and assigns a confidence score.

    Args:
        description: The transaction description/memo string.
        amount: The numeric transaction amount (used for income sanity checks).

    Returns:
        A tuple of (category_name, confidence_score) where confidence is between 0.0 and 1.0.
    """
    lower_desc = description.lower().strip()
    best_category = "Other"
    best_confidence = 0.0

    for category, rules in CATEGORY_RULES.items():
        for pattern, confidence in rules:
            if re.search(pattern, lower_desc):
                if confidence > best_confidence:
                    best_confidence = confidence
                    best_category = category
                # Don't break — keep scanning for a higher-confidence match

    # Income sanity check: if categorized as Income but amount is negative, override
    if best_category == "Income" and amount < 0:
        best_category = "Other"
        best_confidence = 0.0

    return best_category, round(best_confidence, 2)


def categorize_transactions(df: pd.DataFrame) -> pd.DataFrame:
    """Categorizes an entire DataFrame of transactions.

    Args:
        df: A pandas DataFrame containing at least 'description' and 'amount' columns.

    Returns:
        The DataFrame with added 'category' and 'confidence' columns.
    """
    df = df.copy()
    df["category"] = "Other"
    df["confidence"] = 0.0

    for index, row in df.iterrows():
        description = str(row.get("description", ""))
        amount = float(row.get("amount", 0))

        category, confidence = categorize_description(description, amount)
        df.at[index, "category"] = category
        df.at[index, "confidence"] = confidence

    return df
