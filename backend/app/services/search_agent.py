# Service for web search to find HR/Careers email

import re
from duckduckgo_search import DDGS

def find_hr_email(company_name: str, jd_text: str) -> list[str]:
    """
    Uses DuckDuckGo search to autonomously discover potential HR/recruiter emails
    if they are missing from the Job Description.
    """
    emails_found = set()
    
    # 1. Regex pattern for extracting emails
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    
    # 2. Quick fallback scan on the JD text itself just in case it was missed
    jd_emails = re.findall(email_pattern, jd_text)
    emails_found.update(jd_emails)
    
    # 3. Construct targeted search queries
    domain_guess = company_name.lower().replace(" ", "").replace(",", "").replace(".", "")
    queries = [
        f'"{company_name}" ("recruiter" OR "talent acquisition" OR "HR") email',
        f'"{company_name}" careers contact email',
        f'site:{domain_guess}.com email contact hr'
    ]
    
    # 4. Execute searches using DuckDuckGo
    with DDGS() as ddgs:
        for query in queries:
            try:
                # Get top 5 results for each query
                results = list(ddgs.text(query, max_results=5))
                for result in results:
                    snippet = result.get('body', '') + " " + result.get('title', '')
                    
                    # Extract emails from the search snippet
                    snippet_emails = re.findall(email_pattern, snippet)
                    
                    # Filter for relevance
                    for email in snippet_emails:
                        email = email.lower()
                        # Retain if it matches the guessed domain or contains common HR terms
                        if domain_guess in email or any(alias in email for alias in ['careers', 'jobs', 'hr', 'talent', 'recruiting']):
                            emails_found.add(email)
            except Exception as e:
                print(f"Search query failed '{query}': {e}")
                
    # 5. Return sorted list of discovered emails
    return sorted(list(emails_found))
