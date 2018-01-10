#
# Container spec for dp-cluster-service
#
{{- define "dp-cluster-service-container" -}}
- name: dp-cluster-service
  image: {{ .Values.global.registry }}/{{ .Values.global.hwxRepository }}/{{ .Values.dpClusterService.image.name }}:{{ .Values.global.dpVersion }}
  ports:
    - containerPort: 9009
    - containerPort: 9010
  env:
    - name: CONSUL_HOST
      value: {{ .Values.consul.app.name }}-{{ .Release.Name }}-service.{{ .Values.global.namespace }}.svc.cluster.local
    - name: SEPARATE_KNOX_CONFIG
      value: {{ .Values.global.separateKnoxConfig | quote }}
    - name: KNOX_CONFIG_USING_CREDS
      value: {{ .Values.global.knoxConfigUsingCreds | quote }}
    - name: KEYSTORE_PATH
      value: {{ .Values.global.dpKeystorePath }}
    - name: KEYSTORE_PASSWORD
      valueFrom:
        secretKeyRef:
          name: dp-knox-secret-{{ .Release.Name }}
          key: KNOX_MASTER_PASSWORD
    - name: SINGLE_NODE_CLUSTER
      value: "true"
  volumeMounts:
    - mountPath: {{ .Values.global.certsDir }}
      name: dp-certs-volume
{{- end -}}