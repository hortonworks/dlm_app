#
# Container spec for postgres for DP
#
{{- define "postgres-container" -}}
- name: postgres
  image: {{ .Values.postgres.image.name }}:{{ .Values.postgres.image.version }}
  env:
    - name: PGDATA
      value: {{ .Values.postgres.dataDir }}
    - name: POSTGRES_DB
      value: {{ .Values.postgres.database }}
  envFrom:
  - secretRef:
      name: dp-database-secret-{{ .Release.Name }}
  ports:
    - containerPort: {{ .Values.postgres.port }}
      name: pgport
  volumeMounts:
    - mountPath: {{ .Values.postgres.dataDir }}
      name: postgres-volume
{{- end -}}