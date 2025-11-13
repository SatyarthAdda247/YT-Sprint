"""Master data for verticals, exams, and subjects"""

MASTER_DATA = {
    "Bank Pre": {
        "exams": ["SBI Clerk", "SBI PO", "IBPS CLERK", "IBPS PO", "LIC AAO", "RRB PO", "RRB Clerk"],
        "subjects": ["All Subjects", "None", "Reasoning", "Quants", "English", "General Awareness", "Current Affairs", "Hindi", "Computer"]
    },
    "Bank Post": {
        "exams": ["JAIIB", "CAIIB", "IIBF CERTIFICATION COURSE", "BANK PROMOTION EXAMS"],
        "subjects": ["All Subjects", "None", "AFM", "RBWM", "IEIFS", "PPB", "ABM", "ABFM", "BFM", "BRBL", "CAIIB Elective Subjects", 
                    "CCP + AML", "Foreign Exchange", "Prevention of Cyber Crime", "KYC + IBC + MSME", 
                    "General Banking", "Computer Knowledge", "Banking Law"]
    },
    "SSC": {
        "exams": ["GD", "MTS", "CHSL", "CGL", "Delhi Police", "CPO", "Steno", "RRB NTPC", "ALP", "Group D", "RPF"],
        "subjects": ["All Subjects", "None", "Current Affairs", "English", "GK/GS", "Maths", "Reasoning", "Science", "Shorthand"]
    },
    "Teaching": {
        "exams": ["CTET", "LT Grade", "Bihar STET", "EMRS", "UP GIC", "NVS", "KVS", "HTET", "BPSC TRE 4.0", 
                 "UP TET", "REET", "DSSSB", "TGT", "PGT", "PRT", "TET Exams", "AWES", "SET Exams", 
                 "Super TET", "RPSC Teaching Exam", "Sainik School Exams", "West Bengal SSC Teacher Recruitment"],
        "subjects": ["All Subjects", "None", "English", "Hindi", "Maths", "Sanskrit", "CDP", "EVS", "General Studies", "Commerce", "Urdu", 
                    "Social Studies", "Science", "Home Science", "Music", "Arts", "Social Science", 
                    "Physical Education", "Fine Arts", "Physics", "Chemistry", "Biology", "Zoology", "History", 
                    "Geography", "Political Science", "Sociology", "Economics", "Philosophy", "Psychology", 
                    "Botany", "Computer Science", "GA", "Teaching Aptitude", "Reasoning", "Polity", 
                    "Mathematics", "Current Affairs", "General Science"]
    },
    "UGC": {
        "exams": ["Paper 1", "Paper 2", "SET / SLET", "CSIR NET"],
        "subjects": ["All Subjects", "None", "General Paper", "Political Science", "Philosophy", "Psychology", "Sociology", "History", 
                    "Commerce", "Education", "Home Science", "Physical Education", "Law", "Music", "Sanskrit", 
                    "Geography", "Ayurveda", "Biology", "Hindi", "Environmental Sciences", 
                    "Computer Science and Applications", "Library and Information Science", "Urdu", "English", 
                    "Chemical Sciences", "Earth Sciences", "Life Sciences", "Mathematical Sciences", "Physical Sciences", 
                    "General Aptitude"]
    },
    "Bihar": {
        "exams": ["BPSC AEDO", "BSSC CGL-4", "Bihar Jeevika", "Bihar SI Daroga", "BSSC STENO", 
                 "BSSC Inter level", "BSSC Karyalay parichari", "Bihar Police driver"],
        "subjects": ["All Subjects", "None", "Hindi", "Maths", "GK/GS", "Reasoning", "English", "Science", "Current Affairs", 
                    "Subject Knowledge", "Computer", "Static GK"]
    },
    "Punjab": {
        "exams": ["PSSSB", "Punjab police constable", "High court", "ETT/NTT", "PSTET", "Master Cadre", 
                 "Punjab PCS", "SSC", "Railways"],
        "subjects": ["All Subjects", "None", "Static & Current Affairs", "General Knowledge", "Basic Computer Knowledge", 
                    "Logical Reasoning", "Quantitative Aptitude", "Numerical Aptitude", "General English", 
                    "Punjabi Language", "Punjab GK", "General Awareness", "Arithmetic", "Teaching Aptitude", 
                    "Pedagogy", "Information & Communication Technology (ICT)", "Hindi Language", 
                    "English Language", "Mathematics", "General Science", "Social Science", 
                    "Environmental Studies", "Science", "General Studies", 
                    "Civil Services Aptitude Test (CSAT)", "Reasoning"]
    },
    "Odia": {
        "exams": ["Bed Entrance Exam", "LTR MAINS ARTS", "OSSC CGL", "OSSC PEO", "SSD Sevak Sevika", 
                 "Police Constable", "RI AMIN MAINS", "RRB NTPC", "RRB Group D", "RRb PO", "IBPS Clerk", "OPSC"],
        "subjects": ["All Subjects", "None", "Current Affairs", "Reasoning", "English", "GK/GS", "Geography", "History", "Polity", 
                    "Pedagogy", "Computer", "Physics", "Chemistry", "Mathematics", "Economics"]
    },
    "Telugu": {
        "exams": ["NTPC", "Group-D", "RRB Junior Engineer (CBT-1 Only)", "MTS", "CHSL", "GD", "CGL", 
                 "Bank PO", "Bank Clerk", "APPSC & TGPSC"],
        "subjects": ["All Subjects", "None", "Mathematics", "Reasoning", "Polity", "Economy", "History", "Geography", "Current Affairs", 
                    "Computer", "Arithmetic", "English", "Banking/Financial Awareness", "Credit Co-Operative", 
                    "Science & Tech", "Telangana Movement (for Telangana Exams only)", 
                    "General Science (Physics + Chemistry + Biology)", "Teaching Aptitude", "Pedagogy", 
                    "ICT", "POCSO", "Administrative Aptitude"]
    },
    "Tamil": {
        "exams": ["TNPSC", "TET", "NTPC", "TNUSRB Si", "PC", "IB", "RPF", "RRB JE", "RRB GR D"],
        "subjects": ["All Subjects", "None", "Current Affairs", "English", "Maths", "Geography", "Science", "Psychology", "GK", 
                    "Reasoning", "Biology", "Polity", "History", "GS"]
    },
    "Bengal": {
        "exams": ["WBSSC GROUP C & D", "SSC MTS", "RRB NTPC", "WBP", "Banking", "WBCS"],
        "subjects": ["All Subjects", "None", "Current Affairs", "History", "Polity", "Mathematics", "Gk", "Gs", "English", 
                    "General Studies", "Static Gk", "Reasoning", "Banking Awareness", "Geography"]
    },
    "Agriculture": {
        "exams": ["IBPS SO AFO", "NABARD GRADE A", "FCI AG III Technical", "Haryana ADO/HDO", 
                 "Punjab ADO/HDO", "APSC ADO", "FSSAI CFSO/TO", "MP FSO", "CUET PG Agriculture", 
                 "UPCATET PG", "NSC Trainee", "IFFCO AGT", "KRIBHCO FRT", "Bihar Agriculture Coordinator", 
                 "BPSC BAO/SDAO", "BHO/SHDO", "Bihar Jeevika Bharti", "UPSSSC AGTA", "Cane Supervisor", 
                 "MP ESB", "RPSC Agriculture Supervisor", "DDA SO Horticulture", "DSSSB SO Horticulture", 
                 "NHB SHO", "CCI JCE", "CWC JTA", "BSSC Field Assistant"],
        "subjects": ["All Subjects", "None", "Agronomy", "Genetics & Plant Breeding", "Entomology", "Soil Science", 
                    "Agri. Current Affairs", "Horticulture", "Allied Agriculture", "Animal Husbandry", 
                    "Plant Pathology", "Food Science & Technology"]
    }
}

def get_all_verticals():
    """Get list of all verticals"""
    return list(MASTER_DATA.keys())

def get_exams_by_vertical(vertical):
    """Get exams for a specific vertical"""
    return MASTER_DATA.get(vertical, {}).get("exams", [])

def get_subjects_by_vertical(vertical):
    """Get subjects for a specific vertical"""
    return MASTER_DATA.get(vertical, {}).get("subjects", [])

def get_all_exams():
    """Get all exams across verticals"""
    all_exams = []
    for data in MASTER_DATA.values():
        all_exams.extend(data.get("exams", []))
    return all_exams

def get_all_subjects():
    """Get all unique subjects"""
    all_subjects = set()
    for data in MASTER_DATA.values():
        all_subjects.update(data.get("subjects", []))
    return sorted(list(all_subjects))

# Content sub-categories for when Content Type is "Content"
CONTENT_SUBCATEGORIES = [
    "Conceptual Insights",
    "Tips & Tricks / Shortcuts",
    "PYQs / Practice Questions",
    "Science / GK Facts"
]

def get_content_subcategories():
    """Get content sub-categories"""
    return CONTENT_SUBCATEGORIES

