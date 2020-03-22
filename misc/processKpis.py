# Author: Malek Cellier
# Email: malek.cellier@gmail.com
# Date created: 2020-02-22
# Purpose: postprocess existing json files
# Details: the json files generated from the QCM simulation are numerous and small in size
# This leads to problems at the time of loading them for visualization and postprocessing 
# we introduce a few functions to create a smaller number of bigger files

import json
import re
import glob
import os


def process_all(path_name):
    """
    Find all pov and trace files and gather them by Tx
    """
    os.mkdir(os.path.join(path_name, 'processed'))
    process_povs(path_name)
    process_traces(path_name)


def process_povs(path_name):
    '''
    Gathers all qcmPov.Rx01.json files into qcmPov.Rx.json
    note that the qualifier for the Pov is not always the same. The fixed part is qcmPov.*.json
    '''
    data = {}

    file_re = os.path.join(path_name, 'qcmPov.*.json')

    for file in glob.glob(file_re):
        name = file.split('.')[1]
        # pov type and id
        pov_type = re.findall("\D+", name)[0]
        pov_id = re.findall("\d+", name)[0]
        if pov_type not in data.keys():
            data[pov_type] = {}
        with open(file, 'r') as fid:
            data[pov_type][pov_id] = json.load(fid)

    for pov_type, pov_data in data.items():
        filename = 'qcmPov.' + pov_type + '.json'
        with open(os.path.join(path_name, 'processed', filename), 'w') as outfile:
            json.dump(pov_data, outfile)


def process_traces(path_name):
    '''
    Gathers all qcmTracev.Rx01.json files into qcmPov.Rx.json
    Gathers all qcmTrace.Tx05-Rx1567.json files into qcmTrace.Tx05.json
    note that the qualifier for the Pov is not always the same. The fixed part is qcmTrace..*.json
    '''
    data = {}

    file_re = os.path.join(path_name, 'qcmTrace.*.json')

    for file in glob.glob(file_re):
        name = file.split('.')[1]
        # The name can contain - to separate the tx from the rx
        # but they too can have - in their name like Tx-01-Rx-04
        dash_parts = name.split('-')
        if len(dash_parts) == 2:  # ex: Tx01-Rx326
            tx_id = dash_parts[0]
            rx_id = dash_parts[1]
        elif len(dash_parts) == 4:
            tx_id = '-'.join(dash_parts[0-2])
            rx_id = '-'.join(dash_parts[2-4])
        if tx_id not in data.keys():
            data[tx_id] = {}

        # Load and read the file
        with open(file, 'r') as fid:
            data[tx_id][rx_id] = json.load(fid)

    # Write the files on the HD
    for tx_id, tx_data in data.items():
        filename = 'qcmTrace.' + tx_id + '.json'
        with open(os.path.join(path_name, 'processed', filename), 'w') as fid:
            json.dump(tx_data, fid)


#process_all('D:\\temp\\outputQcm\\dummy')
