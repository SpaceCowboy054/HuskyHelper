# Make sure to install beautifulsoup, requests, lxml (for xml parsing), selenium and other libraries on the server that the end product will run on

from bs4 import BeautifulSoup, Tag
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import re
import csv
from pathlib import Path
from itertools import islice

def scrape_default_data():
    # start session
    driver = webdriver.Chrome()
    # get all subjects we need to search
    with open("subjects_trunc.csv", "r") as f:
        rows = list(csv.reader(f))
        for i in range(1, len(rows)):
        # for i in range(len(rows) // 2 + 10, len(rows)):
            subject = rows[i][0]
            print("Current subject: " + subject)
            driver.get("https://student.studentadmin.uconn.edu/psc/CSGUE/EMPLOYEE/HRMS/c/UC_ENROLL.UC_GUEST_CLS_SCH.GBL")
            try:
                # find subject field and input desired field
                subject_field = driver.find_element(By.NAME, "UC_DERIVED_GST_SUBJECT")
                subject_field.send_keys(subject + Keys.ENTER)
                
                # sleep to wait for DOM
                time.sleep(1)

                # set semester 
                subject_clickable = driver.find_element(By.NAME, "UC_DERIVED_GST_STRM1")
                subject_clickable.send_keys("Spring" + Keys.ENTER)

                # sleep to wait for DOM
                time.sleep(1)

                # click on search button
                search_button = driver.find_element(By.NAME, "UC_DERIVED_GST_SEARCH")
                # search_button = wait.until(EC.element_to_be_clickable(By.NAME("UC_DERIVED_GST_SEARCH")))
                search_button.click()

            except:
                print("Error when searching for: " + subject + " in course search")

            time.sleep(2)
            soup = BeautifulSoup(driver.page_source, "lxml")
            temp_subj_abbr = soup.find("span", {"id":"UC_CLASS_G_VW_SUBJECT$0"})
            if soup.find("div", {"id" : "alertmsg"}) or (temp_subj_abbr and temp_subj_abbr.get_text() != rows[i][1]) : continue
            subject = subject.replace("/", " ")
            subject = subject.replace(":", "")
            with open("courses_html/" + subject + ".html", "w") as f:
                f.write(soup.prettify())

    driver.quit()

def updateTruncatedSubjectMap():
    """writes csv filee with subject name, subject abbreviation"""
    driver = webdriver.Chrome()
    driver.get("https://student.studentadmin.uconn.edu/psc/CSGUE/EMPLOYEE/HRMS/c/UC_ENROLL.UC_GUEST_CLS_SCH.GBL")
    time.sleep(2)
    soup = BeautifulSoup(driver.page_source, "lxml")
    driver.close()
    dict = {}
    dict["Accounting"] = "ACCT"
    for sibling in soup.find("option", {"value" : "ACCT"}).find_next_siblings():
        dict[sibling.get_text().strip()] = sibling["value"]

    with open("subjects_trunc.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["subject name", "subject abbreviation"])
        for name, abbr in dict.items():
            # name modification have to be the same as      in scrape_default_data() as to maintian consistency across the files and internal data
                # subject = subject.replace("/", " ")
                # subject = subject.replace(":", "")
            name = name.replace("/", " ")
            name = name.replace(":", "")
            writer.writerow([name, abbr])
    
    with open("base.html", "w") as f:
        f.write(soup.prettify())

# for data going into the database, the min length is 1450 lines of html
# We need to put the html data into a csv file
def html_to_csv():
    """Preprocessing of data and normalization into csvs"""
    driver = webdriver.Chrome()

    subj_header_row = ["subject name", "subject abbreviation"]
    course_header_row = ["subject name", "course name", "catalog number", "credits", "term", "description", "enrollment requirements", "quantatative", "writing", 
                         "CA1", "CA2", "CA3", "CA4", "CA4INT", "TOI1", "TOI2", "TOI3", "TOI4", "TOI5", "TOI6"]
    section_header_row = ["course name", "section number", "instructor", "campus", "meeting time", "instruction mode", "required additional sections", 
                          "current enrollment", "max enrollment", "seats available", "reserved seats info", "waitlist available seats"]
    subjects_dict = {}
    courses_rows = []
    section_rows = []
    could_not_find_data = []
    with open("subjects_trunc.csv", "r") as f:
        reader = list(csv.reader(f))
        subject_abbr_map = {reader[i][0]:reader[i][1] for i in range(1, len(reader))}

    # iterate over each html file in our folder
    directory = Path("courses_html/")
    for file in directory.iterdir(): 
        if file.suffix.lower() in [".html"]:
            trunc_subj = file.name[:len(file.name) - 5:]
            driver.get("https://catalog.uconn.edu/undergraduate/courses/" + subject_abbr_map[trunc_subj].lower())
            
            # get full subject name
            course_catalog_soup = BeautifulSoup(driver.page_source, "lxml")
            title_text = course_catalog_soup.head.title.text
            if("Page Not Found" in title_text): 
                could_not_find_data.append(trunc_subj)
                continue
            
            suffix_idx = len(" | University of Connecticut Academic Catalog")
            subject_name = title_text[:title_text[:len(title_text) - suffix_idx:].rfind(" "):]
            subject_abbr = subject_abbr_map[trunc_subj]

            print(subject_name)
            with file.open("r") as f:
                # have to find untruncated course titles and update the csv rows
                section_soup = BeautifulSoup(f.read(), "lxml")

                # id values to look for in the soup
                section_headers = ["UC_CLASS_G_VW_CLASS_SECTION", "UC_DERIVED_GST_SSR_INSTR_LONG", "CAMPUS_CLMN", "HRS_DAYS_LOC_CLMN", "INSTRUCT_MODE_DESCR", "UC_DERIVED_GST_DESCR50",
                                    "UC_CLASS_G_VW_ENRL_TOT", "UC_CLASS_G_VW_ENRL_CAP", "UC_DERIVED_GST_MAX_ATTENDEE","UC_DERIVED_GST_HTMLAREA1", "UC_DERIVED_GST_WAIT_TOT"]
                
                # add subject row (to be formatted into a csv later)
                if(subject_name not in subjects_dict):  
                    subjects_dict[subject_name] = subject_abbr

                # update section and course row
                course_dict = {}
                i = 0
                while True:
                    # update course row
                    catalog_number = section_soup.find("span", id = "UC_CLASS_G_VW_CATALOG_NBR$" + str(i))
                    if catalog_number is None: break # check if we are out of bounds and have searched through all the data
                    catalog_number = catalog_number.get_text().strip()
                    credits = section_soup.find("span", id = "UC_DERIVED_GST_UNITS_RANGE$" + str(i)).get_text().strip()
                    trunc_course_title = section_soup.find("span", id = "UC_CLASS_G_VW_DESCR$" + str(i)).get_text().strip()
                    term = "Spring 2026"
                    # if we haven't found this course yet, find the untruncated course title, add it to our memoization dictionary, and find other course attributes
                    if(catalog_number not in course_dict):
                        for strong in course_catalog_soup.find_all("strong"):
                            strong_text = re.sub(r'[."\']', '', strong.get_text().strip())
                            trunc_course_title = re.sub(r'[^a-zA-Z0-9 ]', '', trunc_course_title)

                            # find the associated catalog number with the current strong object, if it matches our desired catalog number then we have the correct associated title
                            if strong.parent is not None and strong.parent.previous_sibling is not None:
                                strong_catalog_number_element = strong.parent.previous_sibling.previous_sibling.find("strong")
                                if strong_catalog_number_element is None or catalog_number not in strong_catalog_number_element.get_text().strip(): continue
                                else:
                                    print("We found: " + strong_text)
                            else: continue

                            course_dict[catalog_number] = strong_text
                            temp_row = [subject_name, strong_text, catalog_number, credits, term]

                            # Add Description and replace &nbsp; from html with normal space
                            course_description = strong.find_parent("div", {"class" : "cols noindent"}).next_sibling.next.get_text().strip().replace("\u00A0", " ")
                            temp_row.append(course_description)

                            # Add enrollment requirements and replace &nbsp; from html with normal space
                            enrollment_requirements = strong.find_parent("div", {"class" : "cols noindent"}).next_sibling.next_sibling.get_text().strip().replace("\u00A0", " ")
                            temp_row.append(enrollment_requirements)
                            
                            # Add Quantatative / Writing bool attributes
                            temp_row.append("Q" in catalog_number)
                            temp_row.append("W" in catalog_number)
                            
                            # Add Content Areas bool attributes
                            temp_row.append("CA 1." in course_description)
                            temp_row.append("CA 2." in course_description)
                            temp_row.append("CA 3." in course_description)
                            temp_row.append("CA 4." in course_description)
                            temp_row.append("CA 4-INT." in course_description)
                            
                            # Add Topic of Inquiry bool attributes
                            toi_text = None
                            for sibling in strong.find_parent("div", {"class" : "cols noindent"}).next_siblings:
                                if "Topics of Inquiry:" in sibling.get_text():
                                    toi_text = sibling.get_text().strip()
                            
                            if(toi_text is None): temp_row.extend([False] * 6)
                            else:
                                temp_row.append("TOI1" in toi_text)
                                temp_row.append("TOI2" in toi_text)
                                temp_row.append("TOI3" in toi_text)
                                temp_row.append("TOI4" in toi_text)
                                temp_row.append("TOI5" in toi_text)
                                temp_row.append("TOI6" in toi_text)

                            courses_rows.append(temp_row)
                            break # break so we don't search unnecessary courses that aren't in our section_soup
                    i += 1                
                section_counter = 0
                # iterate over all sections in section_soup
                while True:
                    cur_section_row = []
                    for j in range(len(section_headers)):
                        span = section_soup.find("span", id = section_headers[j] + "$" + str(section_counter))
                        section_catalog_number = section_soup.find("span", id = "UC_CLASS_G_VW_CATALOG_NBR$" + str(section_counter))
                        if span is None or section_catalog_number is None: break
                        if j == 0: 
                            # if we do not have the full section name, add the truncated name instead
                            if section_catalog_number.get_text().strip() in course_dict: cur_section_row.append(course_dict[section_catalog_number.get_text().strip()])
                            else: cur_section_row.append(section_soup.find("span", id = "UC_CLASS_G_VW_DESCR$" + str(section_counter)).get_text().strip())
                            cur_section_row.append(span.get_text().strip())
                        elif j == 3:                                                            
                            # remove unneccessary data from the meeting time
                            time = span.get_text().split("(")[0].strip()
                            cur_section_row.append(time)
                        else: cur_section_row.append(span.get_text(" ", strip=True))
                    if span is None: break
                    # print(cur_section_row)
                    section_rows.append(cur_section_row)
                    section_counter += 1
        # generate separate csv files
        with open("subjects.csv", "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(subj_header_row)
            for name, abbr in subjects_dict.items():
                writer.writerow([name, abbr])
        
        with open("courses.csv", "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(course_header_row)
            writer.writerows(courses_rows)
        
        with open("sections.csv", "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(section_header_row)
            writer.writerows(section_rows)
    print("Could not find data for the following courses")
    print(could_not_find_data)
    driver.quit()



if __name__ == "__main__":
    start = time.time()
    # updateTruncatedSubjectMap()
    # scrape_default_data()
    html_to_csv()
    print("Total Elapsed Time in minutes: " + str( (time.time() - start) / 60))

"""

15 minutes for scrape_default_data()

to do:
    problem:
        we are getting extra files in courses_html because I can't determine if the course returns course(s) or is not found
    fix:
        check if the file has "course not found" when we search for the course catalog information
    IMPORTANT:
        this causes a disconnect between section data and course catalog data meaning a course could exist without associating course catalog data, but would you even list this on the website if you didn't have that data?

    improve time complexity of scraping code?
    load csvs into mysql

    we forgot to add environmental column to courses so I added it through sql


    frontend planning:
    html, css (tailwind?), javascript
    draw and visualize the main pages you want
    backend programming language (Nodejs? Nextjs?)
    make endpoints to see how you want the data to be retrieved
        e.g. return courses based on criteria like location/in-person, show different schedules based on preferences, create a class block (comment down below)
    additional questions:
        how should you keep track of the user's saved courses/sections?
        how to send user search options through endpoint?
        how can you track the number of people visiting the site?

sql pk/fk method - using natural keys as staging keys for surrogate key resolution during data loading.

What should the prod pipeline for the U in CRUD look like? (Update)
We should scrape the data and check if we even found the data to begin with (>1450 lines of html)
Compare values to database to see if they need to be updated
format the data and update the database


Let students be able to add a temporary class that I possibly missed from web scraping
this could also be useful for creating time-blocks
""" 