#
# Container spec for dp-db-service
#
{{- define "dp-db-service-container" -}}
- name: dp-db-service
  image: {{ .Values.global.registry }}/{{ .Values.global.hwxRepository }}/{{ .Values.dpDbService.image.name }}:{{ .Values.global.dpVersion }}
  ports:
    - containerPort: 9000
  env:
    - name: CONSUL_HOST
      value: {{ .Values.consul.app.name }}-{{ .Release.Name }}-service.{{ .Values.global.namespace }}.svc.cluster.local
    - name: DATABASE_URI
      value: "{{ .Values.postgres.uri }}{{ .Values.postgres.database }}"
    - name: DATABASE_USER
      valueFrom:
        secretKeyRef:
          name: dp-database-secret-{{ .Release.Name }}
          key: POSTGRES_USER
    - name: DATABASE_PASS
      valueFrom:
        secretKeyRef:
          name: dp-database-secret-{{ .Release.Name }}
          key: POSTGRES_PASSWORD
{{- end -}}