import React, { TdHTMLAttributes } from 'react';
import { CellProps } from 'react-table';
import { Icon } from 'semantic-ui-react';

import { PlaylistsCallbacks, PlaylistsStrings, PlaylistWithLoadingState } from '..';
import Button from '../../Button';
import Tooltip from '../../Tooltip';
import Loader from '../../Loader';
import styles from '../styles.scss';

const SyncCell: React.FC<CellProps<PlaylistWithLoadingState> & PlaylistsStrings & PlaylistsCallbacks> = ({
  cell,
  row,

  uploadToServer,
  downloadFromServer,

  onPlaylistDownload,
  onPlaylistUpload
}) => <td
  {...cell.getCellProps() as TdHTMLAttributes<HTMLTableCellElement>}
  className={styles.sync_cell}
>
  <div className={styles.sync_cell_content}>
    {
      row.original.isLoading 
        ? <Loader type='small' />
        : <>
          <Tooltip
            content={uploadToServer}
            position='top center'
            trigger={
              <Button
                onClick={() => onPlaylistUpload(row.original)}
                basic
                icon
                borderless
              >
                <Icon name='upload' color="purple"/>
              </Button>
            }
          />

          <Tooltip
            content={downloadFromServer}
            position='top center'
            trigger={
              <Button
                onClick={() => onPlaylistDownload(row.original.id)}
                basic
                icon
                borderless
              >
                <Icon name='download' color="green" />
              </Button>
            }
          />
        </>
    }
  </div>
</td>;

export default SyncCell;
