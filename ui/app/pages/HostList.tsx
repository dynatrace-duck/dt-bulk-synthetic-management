import React, { useEffect, useMemo, useState } from 'react';
import { Flex } from '@dynatrace/strato-components/layouts';
import { TitleBar } from '@dynatrace/strato-components/layouts';
import { DataTable, DataTableColumnDef } from '@dynatrace/strato-components/tables';
import { TextInput } from '@dynatrace/strato-components/forms';
import { Text } from '@dynatrace/strato-components/typography';
import { MessageContainer, ProgressCircle } from '@dynatrace/strato-components/content';
import {
  syntheticMonitorsClient,
  MonitorCollectionElement,
} from '@dynatrace-sdk/client-classic-environment-v1';

// Tags used to filter the monitors returned from the API. Adjust to taste.
const MONITOR_TAGS = ['Version:2.0', 'Env:PROD', 'Brand:TNF'];

const columns: DataTableColumnDef<MonitorCollectionElement>[] = [
  { id: 'name', header: 'Name', accessor: 'name' },
  { id: 'type', header: 'Type', accessor: 'type' },
  { id: 'enabled', header: 'Enabled', accessor: 'enabled' },
  { id: 'entityId', header: 'Entity ID', accessor: 'entityId' },
];

interface MonitorTag {
  key?: string;
  value?: string;
}

const getMonitorTags = (monitor: MonitorCollectionElement): MonitorTag[] => {
  const tags = (monitor as { tags?: MonitorTag[] }).tags;
  return Array.isArray(tags) ? tags : [];
};

// Plain text filters on name (case-insensitive, partial); "key:value" matches a tag exactly.
export const filterMonitors = (
  allMonitors: MonitorCollectionElement[],
  query: string,
): MonitorCollectionElement[] => {
  const trimmed = query.trim();
  if (!trimmed) {
    return allMonitors;
  }
  const separator = trimmed.indexOf(':');
  if (separator > 0) {
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    return allMonitors.filter((monitor) =>
      getMonitorTags(monitor).some((tag) => tag.key === key && tag.value === value),
    );
  }
  const needle = trimmed.toLowerCase();
  return allMonitors.filter((monitor) => monitor.name.toLowerCase().includes(needle));
};

export const HostList = () => {
  // React state holds values that, when changed, should cause the component to re-render.
  const [monitors, setMonitors] = useState<MonitorCollectionElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [filterText, setFilterText] = useState('');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  // useEffect runs side effects (like data fetching) after render. The empty
  // dependency array below means this only runs once, when the component mounts.
  useEffect(() => {
    let isCancelled = false;

    const fetchMonitors = async () => {
      setIsLoading(true);
      try {
        const result = await syntheticMonitorsClient.getMonitorsCollection({
          tag: MONITOR_TAGS,
        });
        if (!isCancelled) {
          setMonitors(result.monitors);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err as Error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchMonitors();

    // Cleanup function: avoids updating state if the component unmounts mid-request.
    return () => {
      isCancelled = true;
    };
  }, []);

  // useMemo avoids recreating the columns array on every render, as required by DataTable.
  const tableColumns = useMemo(() => columns, []);

  // filteredMonitors is derived; the loaded monitors are never mutated.
  const filteredMonitors = useMemo(
    () => filterMonitors(monitors, filterText),
    [monitors, filterText],
  );

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  return (
    <Flex width="100%" flexDirection="column" justifyContent="center" gap={16}>
      <TitleBar>
        <TitleBar.Title>Synthetic Monitors</TitleBar.Title>
      </TitleBar>
      {isLoading && <ProgressCircle />}
      {error && (
        <MessageContainer variant="critical">
          <MessageContainer.Title>Failed to load monitors</MessageContainer.Title>
          <MessageContainer.Description>{error.message}</MessageContainer.Description>
        </MessageContainer>
      )}
      {!isLoading && !error && (
        <>
          <TextInput
            placeholder="Filter by name or tag (e.g. checkout, environment:prod)"
            value={filterText}
            onChange={setFilterText}
            aria-label="Filter monitors"
          />
          <Text>
            {selectedCount} {selectedCount === 1 ? 'monitor' : 'monitors'} selected
          </Text>
          <DataTable
            data={filteredMonitors}
            columns={tableColumns}
            fullWidth
            sortable
            selectableRows
            rowId={(row) => row.entityId}
            selectedRows={selectedRows}
            onRowSelectionChange={setSelectedRows}
          />
        </>
      )}
    </Flex>
  );
};