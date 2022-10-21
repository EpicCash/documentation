# **Easy Miner** Documentation 
> Author:  :fontawesome-brands-telegram: [**@blacktyg3r**](https://t.me/blacktyg3r), created  with [mkdocs.org](https://www.mkdocs.org).
!!! warning "Page under construction"

---

## Application core parts
**Easy Miner** is a Cross-platform and user-friendly mining manager working 
with the EPIC Blockchain Protocol. Its job is to set up, run, 
collect feedback from 3rd party software and deliver processed data via API
to front-end interface (GUI).

### 1. Hardware and OS detection
- Collect data:
    - Model and make of GPU 
    - Model and make of CPU 
    - Operating system
- Functions:
    - detect_hardware()
    - detect_system()
    - query_hardware_db() [optional]
    - save_report_db() 

### 2. Setup-wizard
- Collect data:
    - Hardware & software report from database
    - User input (i.e. pool credentials)
- Functions:
    - epic_miner_setup()
    - srb_miner_setup()
    - tt_miner_setup()
    - run_hardware_test()
    - display_test_results()
    - save_report_db() 

### 3. Update manager
### 4. Pool Dashboard
- Functions:
    - connect_to_stratum()
### 5. Mining Calculator
- Collect data:
    - Rig details (from user or database)
    - Blockchain network stats (from explorer API)
    - Crypto market stats (from coingecko API)
- Functions:
    - update_data()
    - make_calculations()
    - display_results()
### 7. GUI interface

---

## Documentation development server
* `mkdocs serve` - Start the live-reloading docs server.
* `mkdocs build` - Build the documentation site.
* `mkdocs -h` - Print help message and exit.

**Documentation layout**

    mkdocs.yml    # The configuration file.
    docs/
        index.md  # The documentation homepage.
        ...       # Other markdown pages, images and other files.
---



